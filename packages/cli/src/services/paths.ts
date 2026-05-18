import type { LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'

export interface GamePathDefinition {
  id: string
  name: string
  description: string
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
    description: 'Three fast missions that teach the core edit-test-attack loop.',
    levelIds: ['s1-l1', 's2-l1', 's4-l1'],
  },
  {
    id: 'api-foundations',
    name: 'API Foundations',
    description: 'OAuth2, pagination, token refresh, beneficiaries, and safe payments.',
    levelIds: ['s1-l1', 's1-l2', 's1-l3', 's1-l4', 's1-l5', 's1-l6'],
  },
  {
    id: 'card-code',
    name: 'Card Code',
    description: 'Programmable Banking card rules, budgets, velocity, and state discipline.',
    levelIds: ['s2-l1', 's2-l2', 's2-l3', 's2-l4', 's2-l5', 's2-l6'],
  },
  {
    id: 'security',
    name: 'Security Path',
    description: 'Validation, HMAC verification, allowlists, injection defense, and registry trust.',
    levelIds: ['s2-l1', 's3-l1', 's4-l1', 's4-l4', 's4-l5'],
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster Run',
    description: 'All missions required for swag eligibility.',
    levelIds: [
      's1-l1', 's1-l2', 's1-l3', 's1-l4', 's1-l5', 's1-l6',
      's2-l1', 's2-l2', 's2-l3', 's2-l4', 's2-l5', 's2-l6',
      's3-l1',
      's4-l1', 's4-l2', 's4-l3', 's4-l4', 's4-l5', 's4-l6',
    ],
  },
]

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
