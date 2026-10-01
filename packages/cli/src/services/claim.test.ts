import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import type { LevelProgress } from '@investec-game/shared'
import type { ResolvedLevel } from '../levels/loader.js'
import { buildClaimBundle, buildClaimIssueUrl } from './claim.js'

function level(season: number, number: number, boss = false): ResolvedLevel {
  return {
    manifest: { id: `s${season}-l${number}`, name: 'Test mission', season, level: number, difficulty: 'beginner', apiRequired: false, attackName: 'Test attack', tags: [], boss },
    dir: '', solutionPath: '', starterPath: '', storyPath: '', hintsDir: '', testsDir: '', attackDir: '', referencePath: '', debriefPath: '',
  }
}

function progress(levelId: string, start = '2026-09-30T10:00:00.000Z', end = '2026-09-30T10:10:00.000Z'): LevelProgress {
  return { levelId, status: 'complete', attempts: 2, hintsUsed: 1, startedAt: start, completedAt: end }
}

describe('claim bundle', () => {
  it('requires a nonempty, fully completed campaign', () => {
    expect(() => buildClaimBundle([], [])).toThrow('Claim locked')
    expect(() => buildClaimBundle([level(1, 1)], [])).toThrow('0/1')
    expect(() => buildClaimBundle([level(1, 1)], [{ ...progress('s1-l1'), status: 'active' }])).toThrow('0/1')
  })

  it('uses canonical campaign order, existing XP rules, and a stable content hash', () => {
    const levels = [level(2, 1, true), level(1, 1)]
    const entries = [progress('s2-l1'), progress('s1-l1')]
    const bundle = buildClaimBundle(levels, entries)
    expect(bundle.levels.map((entry) => entry.id)).toEqual(['s1-l1', 's2-l1'])
    expect(bundle.levels[0]).toMatchObject({ attempts: 2, hintsUsed: 1, xp: 150 })
    expect(bundle.totalXp).toBe(400)
    expect(bundle.maxXp).toBe(450)
    expect(buildClaimBundle([...levels].reverse(), [...entries].reverse())).toEqual(bundle)
    const { contentHash, ...payload } = bundle
    expect(contentHash).toBe(createHash('sha256').update(JSON.stringify(payload)).digest('hex'))
    expect(buildClaimBundle(levels, [{ ...entries[0]!, attempts: 3 }, entries[1]!]).contentHash).not.toBe(contentHash)
  })

  it('preserves multi-day mission timestamps as metadata without calculating time or changing XP', () => {
    const levels = [level(1, 1)]
    const entries = [progress('s1-l1', '2026-09-28T10:00:00.000Z', '2026-10-02T10:15:00.000Z')]
    const original = structuredClone(entries)
    const bundle = buildClaimBundle(levels, entries)
    expect(bundle.levels[0]).toMatchObject({ startedAt: entries[0]!.startedAt, completedAt: entries[0]!.completedAt })
    expect(Object.keys(bundle)).toEqual(['schemaVersion', 'cliVersion', 'totalLevels', 'totalXp', 'maxXp', 'levels', 'contentHash'])
    expect(Object.keys(bundle.levels[0]!)).toEqual(['id', 'attempts', 'hintsUsed', 'startedAt', 'completedAt', 'xp'])
    expect(bundle.totalXp).toBe(buildClaimBundle(levels, [progress('s1-l1')]).totalXp)
    expect(entries).toEqual(original)
  })

  it('accepts missing legacy timestamps as metadata without inventing a duration', () => {
    const bundle = buildClaimBundle([level(1, 1)], [{ ...progress('s1-l1'), startedAt: null, completedAt: null }])
    expect(bundle.levels[0]).toMatchObject({ startedAt: null, completedAt: null, xp: 150 })
    expect(bundle).not.toHaveProperty('totalElapsedSeconds')
    expect(bundle).not.toHaveProperty('timeBasis')
    expect(new URL(buildClaimIssueUrl(bundle)).searchParams.has('timestamp')).toBe(false)
  })

  it('rejects reversed timestamps and invalid progress counters', () => {
    expect(() => buildClaimBundle([level(1, 1)], [progress('s1-l1', '2026-09-30T11:00:00.000Z')])).toThrow('Invalid recorded timestamps')
    expect(() => buildClaimBundle([level(1, 1)], [{ ...progress('s1-l1'), hintsUsed: -1 }])).toThrow()
  })

  it('pre-fills only the completion bundle and leaves self-reported time blank', () => {
    const bundle = buildClaimBundle([level(1, 1)], [progress('s1-l1')])
    const url = new URL(buildClaimIssueUrl(bundle))
    expect(url.pathname).toBe('/Investec-Developer-Community/investec-dev-quest/issues/new')
    expect(url.searchParams.get('template')).toBe('swag_claim.yml')
    expect(JSON.parse(url.searchParams.get('claim_bundle')!)).toEqual(bundle)
    expect([...url.searchParams.keys()]).toEqual(['template', 'title', 'claim_bundle'])
    expect(url.searchParams.has('timestamp')).toBe(false)
  })

  it('keeps a 23-level pre-filled issue URL below 8000 characters', () => {
    const levels = Array.from({ length: 23 }, (_, index) => level(1, index + 1))
    const bundle = buildClaimBundle(levels, levels.map((entry) => progress(entry.manifest.id)))
    expect(buildClaimIssueUrl(bundle).length).toBeLessThan(8000)
  })
})
