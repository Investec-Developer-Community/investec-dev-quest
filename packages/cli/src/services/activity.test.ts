import { describe, expect, it } from 'vitest'
import { activeStreak, advanceStreak, daysSince, describeLastPlayed } from './activity.js'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h)

describe('daily streaks', () => {
  it('starts a streak on first play', () => {
    const state = advanceStreak(null, at(2026, 9, 1))
    expect(state.streakDays).toBe(1)
    expect(state.bestStreak).toBe(1)
    expect(state.lastPlayedDate).toBe('2026-09-01')
  })

  it('does not double count the same day', () => {
    const first = advanceStreak(null, at(2026, 9, 1, 9))
    const again = advanceStreak(first, at(2026, 9, 1, 22))
    expect(again.streakDays).toBe(1)
  })

  it('extends on consecutive days and resets after a gap', () => {
    const day1 = advanceStreak(null, at(2026, 9, 1))
    const day2 = advanceStreak(day1, at(2026, 9, 2))
    const day3 = advanceStreak(day2, at(2026, 9, 3))
    expect(day3.streakDays).toBe(3)

    const afterGap = advanceStreak(day3, at(2026, 9, 6))
    expect(afterGap.streakDays).toBe(1)
    expect(afterGap.bestStreak).toBe(3)
  })

  it('crosses month boundaries', () => {
    const lastDay = advanceStreak(null, at(2026, 8, 31))
    expect(advanceStreak(lastDay, at(2026, 9, 1)).streakDays).toBe(2)
  })

  it('reports an active streak only until the day after last play', () => {
    const state = advanceStreak(advanceStreak(null, at(2026, 9, 1)), at(2026, 9, 2))
    expect(activeStreak(state, at(2026, 9, 3))).toBe(2)
    expect(activeStreak(state, at(2026, 9, 4))).toBe(0)
    expect(daysSince(state, at(2026, 9, 5))).toBe(3)
  })

  it('describes the last played gap', () => {
    expect(describeLastPlayed(0)).toBe('earlier today')
    expect(describeLastPlayed(1)).toBe('yesterday')
    expect(describeLastPlayed(4)).toBe('4 days ago')
  })
})
