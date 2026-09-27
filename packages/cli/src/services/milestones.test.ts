import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import type { LevelManifest, LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { buildBadgeShareText, detectMilestones, listBadges, nearestBadge } from './milestones.js'
import { extractTestSource } from './walkthrough.js'
import { formatEstimate } from './paths.js'

function level(id: string, season: number, levelNumber: number, estimatedMinutes = 10): ResolvedLevel {
  const manifest: LevelManifest = {
    id,
    name: id,
    season,
    level: levelNumber,
    difficulty: 'beginner',
    boss: false,
    apiRequired: false,
    attackName: 'Test Attack',
    estimatedMinutes,
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
  return { levelId, status: 'complete', attempts: 1, hintsUsed: 0, startedAt: null, completedAt: new Date(0).toISOString() }
}

const levels = [level('s2-l1', 2, 1), level('s1-l1', 1, 1), level('s4-l1', 4, 1), level('s3-l1', 3, 1)]

describe('milestones', () => {
  it('awards path and season badges exactly once when they complete', () => {
    const before = [complete('s2-l1'), complete('s1-l1')]
    const after = [...before, complete('s4-l1')]
    const milestones = detectMilestones(levels, before, after)
    const headlines = milestones.map((entry) => entry.headline)

    expect(headlines).toContain('Badge earned: Quickstart Graduate')
    expect(headlines).toContain('Badge earned: AI Guardian')
    expect(headlines).toContain('Promotion: Response Cell Analyst')
    expect(headlines).not.toContain('Badge earned: Card Desk Lead')
    expect(detectMilestones(levels, after, after)).toEqual([])
  })

  it('finds the nearest unearned badge', () => {
    const badge = nearestBadge(levels, [complete('s2-l1')])
    expect(badge?.remaining).toBe(1)
  })

  it('builds share text for earned badges', () => {
    const badge = listBadges(levels, [complete('s3-l1')]).find((entry) => entry.id === 'season:3')
    expect(badge?.earned).toBe(true)
    expect(buildBadgeShareText(badge!)).toContain('#InvestecDevQuest')
  })
})

describe('estimates', () => {
  it('formats minutes and hours', () => {
    expect(formatEstimate(undefined)).toBe('')
    expect(formatEstimate(20)).toBe('~20 min')
    expect(formatEstimate(60)).toBe('~1h')
    expect(formatEstimate(95)).toBe('~1h 35m')
  })
})

describe('walkthrough source extraction', () => {
  it('extracts the matching test block', () => {
    const dir = mkdtempSync(join(tmpdir(), 'walkthrough-'))
    writeFileSync(
      join(dir, 'behavior.test.js'),
      [
        "it('other test', () => {",
        '  expect(1).toBe(1)',
        '})',
        '',
        "it('declines blocked MCC', () => {",
        "  const result = run({ code: '5816' })",
        '  expect(result.approved).toBe(false)',
        '})',
        '',
        "it('after', () => {})",
      ].join('\n')
    )

    const found = extractTestSource([dir], 'declines blocked MCC')
    expect(found?.file).toBe('behavior.test.js')
    expect(found?.source).toContain('expect(result.approved).toBe(false)')
    expect(found?.source).not.toContain('after')
    expect(extractTestSource([dir], 'missing')).toBeNull()
  })
})
