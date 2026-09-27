export interface ActivityState {
  lastPlayedAt: string
  /** Local calendar date (YYYY-MM-DD) so streaks follow the player's own day boundary. */
  lastPlayedDate: string
  streakDays: number
  bestStreak: number
}

export function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function daysSince(activity: ActivityState, now: Date = new Date()): number {
  const today = dateFromKey(localDateKey(now))
  const last = dateFromKey(activity.lastPlayedDate)
  return Math.max(0, Math.round((today.getTime() - last.getTime()) / 86_400_000))
}

export function advanceStreak(previous: ActivityState | null, now: Date = new Date()): ActivityState {
  const today = localDateKey(now)
  const lastPlayedAt = now.toISOString()

  if (!previous) {
    return { lastPlayedAt, lastPlayedDate: today, streakDays: 1, bestStreak: 1 }
  }

  if (previous.lastPlayedDate === today) {
    return { ...previous, lastPlayedAt }
  }

  const streakDays = daysSince(previous, now) === 1 ? previous.streakDays + 1 : 1
  return {
    lastPlayedAt,
    lastPlayedDate: today,
    streakDays,
    bestStreak: Math.max(previous.bestStreak, streakDays),
  }
}

/** A streak survives until the end of the day after the last play. */
export function activeStreak(activity: ActivityState | null, now: Date = new Date()): number {
  if (!activity) return 0
  return daysSince(activity, now) <= 1 ? activity.streakDays : 0
}

export function describeLastPlayed(days: number): string {
  if (days === 0) return 'earlier today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}
