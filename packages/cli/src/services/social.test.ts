import { describe, expect, it } from 'vitest'
import type { LevelManifest, LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { collectSocialMoments, socialPromptsDisabled } from './social.js'
import { buildShareApproachUrl, buildStuckDiscussionUrl, buildXShareUrl } from './community.js'
import { buildNextForPath } from './realWorld.js'
import { GAME_PATHS } from './paths.js'

function level(id: string, season: number, levelNumber: number, boss = false): ResolvedLevel {
  const manifest: LevelManifest = {
    id,
    name: id,
    season,
    level: levelNumber,
    difficulty: 'beginner',
    boss,
    apiRequired: false,
    attackName: 'Test Attack',
    estimatedMinutes: 10,
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

const levels = [level('s2-l1', 2, 1), level('s1-l1', 1, 1), level('s4-l1', 4, 1), level('s2-l6', 2, 6, true)]

describe('social moments', () => {
  it('offers a first-win moment on the very first completion', () => {
    const moments = collectSocialMoments(levels, [], [complete('s2-l1')], levels[0]!.manifest)
    expect(moments.map((moment) => moment.key)).toEqual(['first-win'])
  })

  it('ranks a new path badge above later generic moments', () => {
    const before = [complete('s2-l1'), complete('s1-l1')]
    const moments = collectSocialMoments(levels, before, [...before, complete('s4-l1')], levels[2]!.manifest)
    expect(moments[0]?.key).toBe('path:quickstart')
  })

  it('offers a first-boss moment once', () => {
    const before = [complete('s2-l1')]
    const moments = collectSocialMoments(levels, before, [...before, complete('s2-l6')], levels[3]!.manifest)
    expect(moments.map((moment) => moment.key)).toContain('first-boss')
  })

  it('offers nothing when replaying an already completed level', () => {
    const progress = [complete('s2-l1')]
    expect(collectSocialMoments(levels, progress, progress, levels[0]!.manifest)).toEqual([])
  })

  it('respects the GAME_QUIET_SOCIAL opt-out', () => {
    expect(socialPromptsDisabled({ GAME_QUIET_SOCIAL: '1' })).toBe(true)
    expect(socialPromptsDisabled({ GAME_QUIET_SOCIAL: 'true' })).toBe(true)
    expect(socialPromptsDisabled({ GAME_QUIET_SOCIAL: '0' })).toBe(false)
    expect(socialPromptsDisabled({})).toBe(false)
  })
})

describe('community links', () => {
  const manifest = levels[0]!.manifest

  it('routes stuck players to Q&A and approaches to Show and tell', () => {
    expect(buildStuckDiscussionUrl(manifest)).toContain('/discussions/new?category=q-a&title=')
    expect(buildShareApproachUrl(manifest)).toContain('category=show-and-tell')
  })

  it('builds an X share URL with hashtag and repo link', () => {
    const url = new URL(buildXShareUrl('I blocked an exploit.'))
    expect(url.searchParams.get('text')).toContain('#InvestecDevQuest')
    expect(url.searchParams.get('text')).toContain('github.com/Investec-Developer-Community/investec-dev-quest')
  })

  it('has a real-API build suggestion for every path', () => {
    for (const path of GAME_PATHS) {
      const suggestion = buildNextForPath(path.id)
      expect(suggestion?.links.length).toBeGreaterThan(0)
      for (const link of suggestion!.links) expect(link.url).toMatch(/^https:\/\//)
    }
  })
})
