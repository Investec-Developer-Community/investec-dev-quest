import { createHash } from 'node:crypto'
import { LevelProgressSchema, type LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { CLI_VERSION } from '../version.js'
import { buildCompletionSummary, calculateLevelXp } from './certificate.js'
import { REPO_URL } from './community.js'

export interface ClaimLevel {
  id: string
  attempts: number
  hintsUsed: number
  startedAt: string | null
  completedAt: string | null
  xp: number
}

export interface ClaimBundle {
  schemaVersion: 1
  cliVersion: string
  totalLevels: number
  totalXp: number
  maxXp: number
  levels: ClaimLevel[]
  contentHash: string
}

export function buildClaimBundle(levels: ResolvedLevel[], progress: LevelProgress[]): ClaimBundle {
  const orderedLevels = [...levels].sort((first, second) =>
    first.manifest.season - second.manifest.season || first.manifest.level - second.manifest.level
  )
  const summary = buildCompletionSummary(orderedLevels, progress)
  if (summary.total === 0 || summary.complete !== summary.total) {
    throw new Error(`Claim locked: ${summary.complete}/${summary.total} missions complete. Complete every mission first.`)
  }
  const progressMap = new Map(progress.map((entry) => [entry.levelId, entry]))
  const claimLevels = orderedLevels.map(({ manifest }) => {
    const entry = LevelProgressSchema.parse(progressMap.get(manifest.id))
    if (entry.startedAt && entry.completedAt && Date.parse(entry.completedAt) < Date.parse(entry.startedAt)) {
      throw new Error(`Invalid recorded timestamps for ${manifest.id}.`)
    }
    return {
      id: manifest.id,
      attempts: entry.attempts,
      hintsUsed: entry.hintsUsed,
      startedAt: entry.startedAt,
      completedAt: entry.completedAt,
      xp: calculateLevelXp({ attempts: entry.attempts, hintsUsed: entry.hintsUsed, boss: manifest.boss }),
    }
  })
  const payload = {
    schemaVersion: 1 as const,
    cliVersion: CLI_VERSION,
    totalLevels: summary.total,
    totalXp: summary.totalXp,
    maxXp: summary.maxXp,
    levels: claimLevels,
  }
  return {
    ...payload,
    contentHash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
  }
}

export function buildClaimIssueUrl(bundle: ClaimBundle): string {
  const params = new URLSearchParams({
    template: 'swag_claim.yml',
    title: `Swag claim: ${bundle.totalLevels}/${bundle.totalLevels} complete`,
    claim_bundle: JSON.stringify(bundle),
  })
  return `${REPO_URL}/issues/new?${params.toString()}`
}