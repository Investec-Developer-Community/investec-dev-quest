import type { LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { CLI_VERSION } from '../version.js'

export interface CompletionSummary {
  total: number
  complete: number
  noHintSolves: number
  lowAttemptSolves: number
  totalXp: number
  maxXp: number
  completeLevels: ResolvedLevel[]
  remainingLevels: ResolvedLevel[]
}

export interface LevelXpInput {
  attempts?: number | undefined
  hintsUsed?: number | undefined
  boss?: boolean | undefined
}

export interface LevelXpBreakdown {
  base: number
  hintBonus: number
  attemptBonus: number
  bossBonus: number
  total: number
}

export function hintBonusFor(hintsUsed: number): number {
  if (hintsUsed <= 0) return 50
  if (hintsUsed === 1) return 25
  if (hintsUsed === 2) return 10
  return 0
}

export function attemptBonusFor(attempts: number): number {
  if (attempts <= 2) return 25
  if (attempts <= 4) return 10
  return 0
}

export function calculateLevelXpBreakdown(input: LevelXpInput): LevelXpBreakdown {
  const base = 100
  const hintBonus = hintBonusFor(input.hintsUsed ?? 0)
  const attemptBonus = attemptBonusFor(input.attempts ?? 0)
  const bossBonus = input.boss ? 100 : 0
  return { base, hintBonus, attemptBonus, bossBonus, total: base + hintBonus + attemptBonus + bossBonus }
}

export function calculateLevelXp(input: LevelXpInput): number {
  return calculateLevelXpBreakdown(input).total
}

export function buildCompletionSummary(
  levels: ResolvedLevel[],
  progress: LevelProgress[]
): CompletionSummary {
  const progressMap = new Map(progress.map((entry) => [entry.levelId, entry]))
  const completeLevels = levels.filter((level) => progressMap.get(level.manifest.id)?.status === 'complete')
  const remainingLevels = levels.filter((level) => progressMap.get(level.manifest.id)?.status !== 'complete')
  const totalXp = completeLevels.reduce((sum, level) => {
    const entry = progressMap.get(level.manifest.id)
    return sum + calculateLevelXp({
      attempts: entry?.attempts,
      hintsUsed: entry?.hintsUsed,
      boss: level.manifest.boss,
    })
  }, 0)
  const maxXp = levels.reduce((sum, level) => sum + calculateLevelXp({
    attempts: 0,
    hintsUsed: 0,
    boss: level.manifest.boss,
  }), 0)

  return {
    total: levels.length,
    complete: completeLevels.length,
    noHintSolves: completeLevels.filter((level) => progressMap.get(level.manifest.id)?.hintsUsed === 0).length,
    lowAttemptSolves: completeLevels.filter((level) => {
      const attempts = progressMap.get(level.manifest.id)?.attempts ?? Number.POSITIVE_INFINITY
      return attempts <= 2
    }).length,
    totalXp,
    maxXp,
    completeLevels,
    remainingLevels,
  }
}

export const RANK_LADDER: Array<{ minComplete: number; title: string }> = [
  { minComplete: 12, title: 'Response Cell Specialist' },
  { minComplete: 6, title: 'Response Cell Responder' },
  { minComplete: 3, title: 'Response Cell Analyst' },
  { minComplete: 0, title: 'Response Cell Recruit' },
]

export function playerTitle(summary: CompletionSummary): string {
  if (summary.complete < summary.total) {
    return RANK_LADDER.find((rank) => summary.complete >= rank.minComplete)?.title ?? 'Response Cell Recruit'
  }
  if (summary.noHintSolves === summary.total) return 'Silent Systems Grandmaster'
  if (summary.lowAttemptSolves >= Math.ceil(summary.total * 0.75)) return 'Incident Response Architect'
  return 'Investec Developer Quest Finisher'
}

export function buildCertificateText(summary: CompletionSummary, completedAt = new Date()): string {
  const lines = [
    'INVESTEC DEVELOPER QUEST CERTIFICATE',
    '',
    `Title: ${playerTitle(summary)}`,
    `Completed: ${completedAt.toISOString().slice(0, 10)}`,
    `CLI Version: ${CLI_VERSION}`,
    '',
    `Missions Complete: ${summary.complete}/${summary.total}`,
    `Total XP: ${summary.totalXp}/${summary.maxXp}`,
    `No-Hint Solves: ${summary.noHintSolves}`,
    `Low-Attempt Solves: ${summary.lowAttemptSolves}`,
    '',
    'Completed Levels:',
    ...summary.completeLevels.map(
      (level) => `- S${level.manifest.season}L${level.manifest.level}: ${level.manifest.name}`
    ),
  ]

  return lines.join('\n')
}
