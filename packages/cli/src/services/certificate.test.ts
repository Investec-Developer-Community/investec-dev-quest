import { describe, expect, it } from 'vitest'
import type { LevelManifest, LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { buildCertificateText, buildCompletionSummary, playerTitle } from './certificate.js'

function level(id: string, season: number, levelNumber: number): ResolvedLevel {
  const manifest: LevelManifest = {
    id,
    name: id,
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

function progress(levelId: string, attempts: number, hintsUsed: number): LevelProgress {
  return {
    levelId,
    status: 'complete',
    attempts,
    hintsUsed,
    startedAt: null,
    completedAt: new Date(0).toISOString(),
  }
}

describe('completion certificate', () => {
  it('summarizes badge counts and renders shareable text', () => {
    const levels = [level('s1-l1', 1, 1), level('s1-l2', 1, 2)]
    const summary = buildCompletionSummary(levels, [
      progress('s1-l1', 1, 0),
      progress('s1-l2', 3, 1),
    ])

    expect(summary.complete).toBe(2)
    expect(summary.noHintSolves).toBe(1)
    expect(summary.lowAttemptSolves).toBe(1)
    expect(playerTitle(summary)).toBe('Investec Developer Quest Finisher')
    expect(buildCertificateText(summary, new Date('2026-05-18T00:00:00Z'))).toContain('Missions Complete: 2/2')
  })
})
