import type { LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { GAME_PATHS, summarizePathProgress } from './paths.js'
import { buildCompletionSummary, playerTitle } from './certificate.js'
import { REPO_URL } from './community.js'

export const SEASON_NAMES: Record<number, string> = {
  1: 'API Foundations',
  2: 'Card Code & Rules Engine',
  3: 'Secure Fintech Workflows',
  4: 'Intelligent Banking Automation',
}

const SEASON_BADGES: Record<number, string> = {
  1: 'API Desk Lead',
  2: 'Card Desk Lead',
  3: 'Workflow Sentinel',
  4: 'AI Guardian',
}

export interface Badge {
  id: string
  kind: 'path' | 'season'
  name: string
  source: string
  complete: number
  total: number
  earned: boolean
}

export interface Milestone {
  kind: 'path' | 'season' | 'rank'
  headline: string
  detail: string
  badgeId?: string
}

export function listBadges(levels: ResolvedLevel[], progress: LevelProgress[]): Badge[] {
  const completeIds = new Set(progress.filter((entry) => entry.status === 'complete').map((entry) => entry.levelId))

  const pathBadges: Badge[] = GAME_PATHS.map((path) => {
    const summary = summarizePathProgress(path, levels, progress)
    return {
      id: `path:${path.id}`,
      kind: 'path',
      name: path.badge,
      source: path.name,
      complete: summary.complete,
      total: summary.total,
      earned: summary.total > 0 && summary.complete === summary.total,
    }
  })

  const seasons = [...new Set(levels.map((level) => level.manifest.season))].sort((a, b) => a - b)
  const seasonBadges: Badge[] = seasons.map((season) => {
    const seasonLevels = levels.filter((level) => level.manifest.season === season)
    const complete = seasonLevels.filter((level) => completeIds.has(level.manifest.id)).length
    return {
      id: `season:${season}`,
      kind: 'season',
      name: SEASON_BADGES[season] ?? `Season ${season} Veteran`,
      source: `Season ${season}${SEASON_NAMES[season] ? ` — ${SEASON_NAMES[season]}` : ''}`,
      complete,
      total: seasonLevels.length,
      earned: seasonLevels.length > 0 && complete === seasonLevels.length,
    }
  })

  return [...pathBadges, ...seasonBadges]
}

export function detectMilestones(
  levels: ResolvedLevel[],
  before: LevelProgress[],
  after: LevelProgress[]
): Milestone[] {
  const earnedBefore = new Set(listBadges(levels, before).filter((badge) => badge.earned).map((badge) => badge.id))
  const milestones: Milestone[] = listBadges(levels, after)
    .filter((badge) => badge.earned && !earnedBefore.has(badge.id))
    .map((badge) => ({
      kind: badge.kind,
      headline: `Badge earned: ${badge.name}`,
      detail: `${badge.source} complete (${badge.total}/${badge.total})`,
      badgeId: badge.id,
    }))

  const titleBefore = playerTitle(buildCompletionSummary(levels, before))
  const titleAfter = playerTitle(buildCompletionSummary(levels, after))
  if (titleBefore !== titleAfter) {
    milestones.push({ kind: 'rank', headline: `Promotion: ${titleAfter}`, detail: `Previously ${titleBefore}` })
  }

  return milestones
}

/** The unearned badge closest to completion, preferring earlier entries on ties. */
export function nearestBadge(levels: ResolvedLevel[], progress: LevelProgress[]): (Badge & { remaining: number }) | null {
  let best: (Badge & { remaining: number }) | null = null
  for (const badge of listBadges(levels, progress)) {
    if (badge.earned || badge.total === 0) continue
    const remaining = badge.total - badge.complete
    if (!best || remaining < best.remaining) best = { ...badge, remaining }
  }
  return best
}

export function buildBadgeShareText(badge: Badge): string {
  return `I earned the "${badge.name}" badge in Investec Developer Quest (${badge.source}, ${badge.total}/${badge.total} missions). #InvestecDevQuest ${REPO_URL}`
}
