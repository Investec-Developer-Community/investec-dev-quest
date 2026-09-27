import type { LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'

export interface GamePathDefinition {
  id: string
  name: string
  description: string
  badge: string
  levelIds: string[]
}

export interface GamePathProgress {
  path: GamePathDefinition
  complete: number
  total: number
  nextLevel: ResolvedLevel | null
}

export const GAME_PATHS: GamePathDefinition[] = [
  {
    id: 'quickstart',
    name: 'Quickstart Path',
    description: 'Three fast missions that teach the core edit-test-attack loop. Starts offline, no API needed.',
    badge: 'Quickstart Graduate',
    levelIds: ['s2-l1', 's1-l1', 's4-l1'],
  },
  {
    id: 'api-foundations',
    name: 'API Foundations',
    description: 'OAuth2, pagination, token reuse, beneficiaries, and safe payments.',
    badge: 'API Foundations Engineer',
    levelIds: ['s1-l1', 's1-l2', 's1-l3', 's1-l4', 's1-l5', 's1-l6'],
  },
  {
    id: 'card-code',
    name: 'Card Code',
    description: 'Programmable Banking card rules, budgets, velocity, and state discipline.',
    badge: 'Card Code Operator',
    levelIds: ['s2-l1', 's2-l2', 's2-l3', 's2-l4', 's2-l5', 's2-l6'],
  },
  {
    id: 'security',
    name: 'Security Path',
    description: 'Validation, HMAC verification, replay windows, SSRF-safe callbacks, allowlists, injection defense, and registry trust.',
    badge: 'Security Specialist',
    levelIds: ['s2-l1', 's3-l1', 's3-l2', 's3-l3', 's4-l1', 's4-l4', 's4-l5'],
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster Run',
    description: 'All missions required for swag eligibility.',
    badge: 'Grandmaster',
    levelIds: [
      's1-l1', 's1-l2', 's1-l3', 's1-l4', 's1-l5', 's1-l6',
      's2-l1', 's2-l2', 's2-l3', 's2-l4', 's2-l5', 's2-l6',
      's3-l1', 's3-l2', 's3-l3', 's3-l4', 's3-l5',
      's4-l1', 's4-l2', 's4-l3', 's4-l4', 's4-l5', 's4-l6',
    ],
  },
]

export interface NextMission {
  level: ResolvedLevel
  path: GamePathDefinition
  complete: number
  total: number
}

/**
 * Campaign routing: finish the Quickstart Path first, then continue the Grandmaster Run in order.
 */
export function resolveNextMission(
  levels: ResolvedLevel[],
  progress: LevelProgress[]
): NextMission | null {
  for (const pathId of ['quickstart', 'grandmaster']) {
    const path = GAME_PATHS.find((entry) => entry.id === pathId)
    if (!path) continue
    const summary = summarizePathProgress(path, levels, progress)
    if (summary.nextLevel) {
      return { level: summary.nextLevel, path, complete: summary.complete, total: summary.total }
    }
  }
  return null
}

export function formatEstimate(minutes: number | undefined): string {
  if (!minutes || minutes <= 0) return ''
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `~${hours}h` : `~${hours}h ${rest}m`
}

export function remainingMinutes(path: GamePathDefinition, levels: ResolvedLevel[], progress: LevelProgress[]): number {
  const completeIds = new Set(progress.filter((entry) => entry.status === 'complete').map((entry) => entry.levelId))
  return levels
    .filter((level) => path.levelIds.includes(level.manifest.id) && !completeIds.has(level.manifest.id))
    .reduce((sum, level) => sum + (level.manifest.estimatedMinutes ?? 0), 0)
}

export function levelCommand(level: ResolvedLevel): string {
  return `pnpm game level ${level.manifest.level} --season ${level.manifest.season}`
}

export function summarizePathProgress(
  path: GamePathDefinition,
  levels: ResolvedLevel[],
  progress: LevelProgress[]
): GamePathProgress {
  const levelMap = new Map(levels.map((level) => [level.manifest.id, level]))
  const completeIds = new Set(
    progress.filter((entry) => entry.status === 'complete').map((entry) => entry.levelId)
  )
  const pathLevels = path.levelIds
    .map((id) => levelMap.get(id))
    .filter((level): level is ResolvedLevel => Boolean(level))
  const complete = pathLevels.filter((level) => completeIds.has(level.manifest.id)).length
  const nextLevel = pathLevels.find((level) => !completeIds.has(level.manifest.id)) ?? null

  return {
    path,
    complete,
    total: pathLevels.length,
    nextLevel,
  }
}
