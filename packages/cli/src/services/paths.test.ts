import { describe, expect, it } from 'vitest'
import type { LevelManifest, LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { GAME_PATHS, levelCommand, resolveNextMission, summarizePathProgress } from './paths.js'

function level(id: string, season: number, levelNumber: number, name = id): ResolvedLevel {
  const manifest: LevelManifest = {
    id,
    name,
    season,
    level: levelNumber,
    difficulty: 'beginner',
    boss: false,
    apiRequired: false,
    attackName: 'Test Attack',
    tags: [],
  }

  return {
    manifest,
    dir: '',
    solutionPath: '',
    starterPath: '',
    storyPath: '',
    hintsDir: '',
    testsDir: '',
    attackDir: '',
    referencePath: '',
    debriefPath: '',
  }
}

function complete(levelId: string): LevelProgress {
  return {
    levelId,
    status: 'complete',
    attempts: 1,
    hintsUsed: 0,
    startedAt: null,
    completedAt: new Date(0).toISOString(),
  }
}

describe('quest path progress', () => {
  it('finds the next incomplete level in path order', () => {
    const path = GAME_PATHS.find((entry) => entry.id === 'quickstart')
    expect(path).toBeDefined()

    const levels = [
      level('s1-l1', 1, 1, 'First Contact'),
      level('s2-l1', 2, 1, 'Merchant Mirage'),
      level('s4-l1', 4, 1, 'Tool Gatekeeper'),
    ]

    const summary = summarizePathProgress(path!, levels, [complete('s2-l1')])

    expect(summary.complete).toBe(1)
    expect(summary.total).toBe(3)
    expect(summary.nextLevel?.manifest.id).toBe('s1-l1')
    expect(levelCommand(summary.nextLevel!)).toBe('pnpm game level 1 --season 1')
  })

  it('starts the Quickstart Path with the offline induction mission', () => {
    const path = GAME_PATHS.find((entry) => entry.id === 'quickstart')
    expect(path?.levelIds[0]).toBe('s2-l1')
  })
})

describe('next mission routing', () => {
  const levels = [
    level('s1-l1', 1, 1),
    level('s1-l2', 1, 2),
    level('s2-l1', 2, 1),
    level('s4-l1', 4, 1),
  ]

  it('routes a fresh profile to the first Quickstart mission', () => {
    const next = resolveNextMission(levels, [])
    expect(next?.level.manifest.id).toBe('s2-l1')
    expect(next?.path.id).toBe('quickstart')
  })

  it('follows the Quickstart Path instead of season order', () => {
    const next = resolveNextMission(levels, [complete('s2-l1'), complete('s1-l1')])
    expect(next?.level.manifest.id).toBe('s4-l1')
  })

  it('continues the Grandmaster Run in campaign order after Quickstart', () => {
    const next = resolveNextMission(levels, [complete('s2-l1'), complete('s1-l1'), complete('s4-l1')])
    expect(next?.level.manifest.id).toBe('s1-l2')
    expect(next?.path.id).toBe('grandmaster')
  })

  it('returns null when every mission is complete', () => {
    const all = levels.map((entry) => complete(entry.manifest.id))
    expect(resolveNextMission(levels, all)).toBeNull()
  })
})
