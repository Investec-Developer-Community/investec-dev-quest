import type { LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { CLI_VERSION } from '../version.js'

export interface CompletionSummary {
  total: number
  complete: number
  noHintSolves: number
  lowAttemptSolves: number
  completeLevels: ResolvedLevel[]
  remainingLevels: ResolvedLevel[]
}

export function buildCompletionSummary(
  levels: ResolvedLevel[],
  progress: LevelProgress[]
): CompletionSummary {
  const progressMap = new Map(progress.map((entry) => [entry.levelId, entry]))
  const completeLevels = levels.filter((level) => progressMap.get(level.manifest.id)?.status === 'complete')
  const remainingLevels = levels.filter((level) => progressMap.get(level.manifest.id)?.status !== 'complete')

  return {
    total: levels.length,
    complete: completeLevels.length,
    noHintSolves: completeLevels.filter((level) => progressMap.get(level.manifest.id)?.hintsUsed === 0).length,
    lowAttemptSolves: completeLevels.filter((level) => {
      const attempts = progressMap.get(level.manifest.id)?.attempts ?? Number.POSITIVE_INFINITY
      return attempts <= 2
    }).length,
    completeLevels,
    remainingLevels,
  }
}

export function playerTitle(summary: CompletionSummary): string {
  if (summary.complete < summary.total) return 'Response Cell Recruit'
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
