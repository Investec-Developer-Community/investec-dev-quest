import { describe, expect, it } from 'vitest'
import type { LevelManifest, LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { attemptBonusFor, buildCertificateText, buildCompletionSummary, calculateLevelXp, hintBonusFor, playerTitle } from './certificate.js'

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
  it('derives level XP without storing XP in progress', () => {
    expect(calculateLevelXp({ attempts: 1, hintsUsed: 0 })).toBe(175)
    expect(calculateLevelXp({ attempts: 3, hintsUsed: 1 })).toBe(135)
    expect(calculateLevelXp({ attempts: 2, hintsUsed: 0, boss: true })).toBe(275)
  })

  it('scales hint and attempt bonuses instead of all-or-nothing', () => {
    expect([0, 1, 2, 3, 4].map(hintBonusFor)).toEqual([50, 25, 10, 0, 0])
    expect([1, 2, 3, 4, 5, 9].map(attemptBonusFor)).toEqual([25, 25, 10, 10, 0, 0])
    expect(calculateLevelXp({ attempts: 9, hintsUsed: 3 })).toBe(100)
  })

  it('promotes rank as missions are completed', () => {
    const levels = Array.from({ length: 19 }, (_, i) => level(`s1-l${i + 1}`, 1, i + 1))
    const titleAt = (count: number) =>
      playerTitle(buildCompletionSummary(levels, levels.slice(0, count).map((entry) => progress(entry.manifest.id, 1, 0))))

    expect(titleAt(0)).toBe('Response Cell Recruit')
    expect(titleAt(3)).toBe('Response Cell Analyst')
    expect(titleAt(6)).toBe('Response Cell Responder')
    expect(titleAt(12)).toBe('Response Cell Specialist')
    expect(titleAt(19)).toBe('Silent Systems Grandmaster')
  })

  it('summarizes badge counts and renders shareable text', () => {
    const levels = [level('s1-l1', 1, 1), level('s1-l2', 1, 2, true)]
    const summary = buildCompletionSummary(levels, [
      progress('s1-l1', 1, 0),
      progress('s1-l2', 3, 1),
    ])

    expect(summary.complete).toBe(2)
    expect(summary.noHintSolves).toBe(1)
    expect(summary.lowAttemptSolves).toBe(1)
    expect(summary.totalXp).toBe(410)
    expect(summary.maxXp).toBe(450)
    expect(playerTitle(summary)).toBe('Investec Developer Quest Finisher')
    const certificate = buildCertificateText(summary, new Date('2026-05-18T00:00:00Z'))
    expect(certificate).toContain('Missions Complete: 2/2')
    expect(certificate).toContain('Total XP: 410/450')
    expect(certificate).toContain('No-Hint Solves: 1')
    expect(certificate).toContain('Low-Attempt Solves: 1')
  })
})
