import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import type { ArcFlagEvidence, ArcFlagKey, ArcFlags, CaseFileEntry, LevelProgress } from '@investec-game/shared'
import { ARC_DEFAULT_FLAGS } from '../services/arcModel.js'
import { advanceStreak, type ActivityState } from '../services/activity.js'

const DB_DIR = join(homedir(), '.investec-game')
const DB_PATH = join(DB_DIR, 'progress.json')

export interface LastRunSummary {
  behaviorPassed: number
  behaviorTotal: number
  attackPassed: number
  attackTotal: number
  at: string
}

interface ProgressStore {
  progress: Record<string, LevelProgress>
  hintUnlocks: Record<string, number[]>
  currentLevelId: string | null
  arcFlags: ArcFlags
  flagEvidence: ArcFlagEvidence[]
  caseFiles: Record<string, CaseFileEntry>
  lastRuns: Record<string, LastRunSummary>
  activity: ActivityState | null
  socialPromptsShown: string[]
}

const DEFAULT_ARC_FLAGS: ArcFlags = { ...ARC_DEFAULT_FLAGS }

function emptyStore(): ProgressStore {
  return {
    progress: {},
    hintUnlocks: {},
    currentLevelId: null,
    arcFlags: { ...DEFAULT_ARC_FLAGS },
    flagEvidence: [],
    caseFiles: {},
    lastRuns: {},
    activity: null,
    socialPromptsShown: [],
  }
}

function readStore(): ProgressStore {
  mkdirSync(DB_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    return emptyStore()
  }
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf-8')) as Partial<ProgressStore>
    return {
      progress: parsed.progress ?? {},
      hintUnlocks: parsed.hintUnlocks ?? {},
      currentLevelId: parsed.currentLevelId ?? null,
      arcFlags: {
        ...DEFAULT_ARC_FLAGS,
        ...(parsed.arcFlags ?? {}),
      },
      flagEvidence: parsed.flagEvidence ?? [],
      caseFiles: parsed.caseFiles ?? {},
      lastRuns: parsed.lastRuns ?? {},
      activity: parsed.activity ?? null,
      socialPromptsShown: parsed.socialPromptsShown ?? [],
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: ProgressStore): void {
  mkdirSync(DB_DIR, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

export function getProgress(levelId: string): LevelProgress | null {
  const store = readStore()
  return store.progress[levelId] ?? null
}

export function getAllProgress(): LevelProgress[] {
  const store = readStore()
  return Object.values(store.progress).sort((a, b) =>
    a.levelId.localeCompare(b.levelId)
  )
}

export function upsertProgress(progress: LevelProgress): void {
  const store = readStore()
  store.progress[progress.levelId] = progress
  writeStore(store)
}

export function incrementAttempts(levelId: string): void {
  const store = readStore()
  const existing = store.progress[levelId]
  if (existing) {
    existing.attempts += 1
    writeStore(store)
  }
}

export function recordHintUnlock(levelId: string, hintIndex: number): void {
  const store = readStore()
  const existing = store.hintUnlocks[levelId] ?? []
  if (!existing.includes(hintIndex)) {
    existing.push(hintIndex)
    store.hintUnlocks[levelId] = existing
  }
  const progress = store.progress[levelId]
  if (progress) {
    progress.hintsUsed = existing.length
  }
  writeStore(store)
}

export function getUnlockedHints(levelId: string): number[] {
  const store = readStore()
  return (store.hintUnlocks[levelId] ?? []).sort((a, b) => a - b)
}

export function getLastRun(levelId: string): LastRunSummary | null {
  const store = readStore()
  return store.lastRuns[levelId] ?? null
}

export function setLastRun(levelId: string, summary: LastRunSummary): void {
  const store = readStore()
  store.lastRuns[levelId] = summary
  writeStore(store)
}

export function getActivity(): ActivityState | null {
  const store = readStore()
  return store.activity
}

export function getShownSocialPrompts(): Set<string> {
  const store = readStore()
  return new Set(store.socialPromptsShown)
}

export function markSocialPromptsShown(keys: string[]): void {
  if (keys.length === 0) return
  const store = readStore()
  store.socialPromptsShown = [...new Set([...store.socialPromptsShown, ...keys])]
  writeStore(store)
}

export function recordActivity(now: Date = new Date()): ActivityState {
  const store = readStore()
  store.activity = advanceStreak(store.activity, now)
  writeStore(store)
  return store.activity
}

export interface LevelCoordinates {
  season: number
  level: number
}

export function parseLevelId(levelId: string): LevelCoordinates | null {
  const match = /^s(\d+)-l(\d+)$/i.exec(levelId)
  if (!match) return null

  const season = Number.parseInt(match[1] ?? '', 10)
  const level = Number.parseInt(match[2] ?? '', 10)
  if (!Number.isFinite(season) || season <= 0) return null
  if (!Number.isFinite(level) || level <= 0) return null

  return { season, level }
}

export function setCurrentLevel(levelId: string): void {
  const store = readStore()
  store.currentLevelId = levelId
  writeStore(store)
}

export function getCurrentLevelId(): string | null {
  const store = readStore()
  return store.currentLevelId
}

export function getCurrentLevelCoordinates(): LevelCoordinates | null {
  const levelId = getCurrentLevelId()
  if (!levelId) return null
  return parseLevelId(levelId)
}

export function getArcFlags(): ArcFlags {
  const store = readStore()
  return { ...store.arcFlags }
}

export function getArcFlagEvidence(): ArcFlagEvidence[] {
  const store = readStore()
  return [...store.flagEvidence]
}

export function getCaseFile(levelId: string): CaseFileEntry | null {
  const store = readStore()
  return store.caseFiles[levelId] ?? null
}

export function getAllCaseFiles(): CaseFileEntry[] {
  const store = readStore()
  return Object.values(store.caseFiles).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function upsertCaseFile(caseFile: CaseFileEntry): void {
  const store = readStore()
  store.caseFiles[caseFile.levelId] = caseFile
  writeStore(store)
}

export interface ArcFlagWriteInput {
  flag: ArcFlagKey
  value: ArcFlags[ArcFlagKey]
  testSignals: string[]
}

export function applyArcFlagWrites(levelId: string, writes: ArcFlagWriteInput[]): void {
  if (writes.length === 0) return

  const store = readStore()
  const now = new Date().toISOString()
  const arcFlags = store.arcFlags as Record<ArcFlagKey, ArcFlags[ArcFlagKey]>

  for (const write of writes) {
    arcFlags[write.flag] = write.value
    store.flagEvidence.push({
      flag: write.flag,
      value: String(write.value),
      levelId,
      writtenAt: now,
      testSignals: [...write.testSignals],
      rubricVersion: 'v1',
    })
  }

  writeStore(store)
}
