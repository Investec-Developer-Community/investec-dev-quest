import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import type { LevelProgress } from '@investec-game/shared'

const DB_DIR = join(homedir(), '.investec-game')
const DB_PATH = join(DB_DIR, 'progress.json')

interface ProgressStore {
  progress: Record<string, LevelProgress>
  hintUnlocks: Record<string, number[]>
  currentLevelId: string | null
}

function readStore(): ProgressStore {
  mkdirSync(DB_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    return { progress: {}, hintUnlocks: {}, currentLevelId: null }
  }
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf-8')) as Partial<ProgressStore>
    return {
      progress: parsed.progress ?? {},
      hintUnlocks: parsed.hintUnlocks ?? {},
      currentLevelId: parsed.currentLevelId ?? null,
    }
  } catch {
    return { progress: {}, hintUnlocks: {}, currentLevelId: null }
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
