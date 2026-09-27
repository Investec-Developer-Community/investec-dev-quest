import type { LevelManifest, LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { listBadges } from './milestones.js'
import { buildCompletionSummary, playerTitle } from './certificate.js'

export interface SocialMoment {
  key: string
  headline: string
  shareText: string
}

export function socialPromptsDisabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const value = (env.GAME_QUIET_SOCIAL ?? '').trim().toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

/**
 * Candidate share moments for a win, most significant first.
 * Each key is shown at most once per profile.
 */
export function collectSocialMoments(
  levels: ResolvedLevel[],
  before: LevelProgress[],
  after: LevelProgress[],
  manifest: LevelManifest
): SocialMoment[] {
  const completeBefore = new Set(before.filter((entry) => entry.status === 'complete').map((entry) => entry.levelId))
  if (completeBefore.has(manifest.id)) return []

  const moments: SocialMoment[] = []
  const summaryAfter = buildCompletionSummary(levels, after)

  if (summaryAfter.total > 0 && summaryAfter.complete === summaryAfter.total) {
    moments.push({
      key: 'campaign-complete',
      headline: 'Campaign complete. Every mission cleared.',
      shareText: `I completed all ${summaryAfter.total} missions of Investec Developer Quest as "${playerTitle(summaryAfter)}", an open-source fintech security game for the terminal.`,
    })
  }

  const earnedBefore = new Set(listBadges(levels, before).filter((badge) => badge.earned).map((badge) => badge.id))
  for (const badge of listBadges(levels, after)) {
    if (badge.kind !== 'path' || !badge.earned || earnedBefore.has(badge.id) || badge.id === 'path:grandmaster') continue
    moments.push({
      key: badge.id,
      headline: `${badge.name} badge earned.`,
      shareText: `I earned the "${badge.name}" badge in Investec Developer Quest by clearing the ${badge.source} (${badge.total} missions).`,
    })
  }

  const bossIds = new Set(levels.filter((level) => level.manifest.boss).map((level) => level.manifest.id))
  if (manifest.boss && ![...completeBefore].some((id) => bossIds.has(id))) {
    moments.push({
      key: 'first-boss',
      headline: 'First season boss defeated.',
      shareText: `I just beat my first season boss, "${manifest.name}", in Investec Developer Quest.`,
    })
  }

  if (completeBefore.size === 0) {
    moments.push({
      key: 'first-win',
      headline: 'First Red Team exploit blocked.',
      shareText: `I just blocked my first Red Team exploit${manifest.attackName ? ` (${manifest.attackName})` : ''} in Investec Developer Quest, an open-source fintech security game for the terminal.`,
    })
  }

  return moments
}
