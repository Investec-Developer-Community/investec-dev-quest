import type { Command } from 'commander'
import { p, pc } from '../ui/theme.js'
import { EXIT_CODES } from '@investec-game/shared'
import { getCurrentLevelCoordinates, setCurrentLevel } from '../db/progress.js'

interface LevelSelectionOptions {
  season?: string
  level?: string
}

interface LevelSelection {
  season: number
  level: number
}

export function resolveLevelSelection(program: Command, opts: LevelSelectionOptions): LevelSelection {
  const hasSeason = opts.season !== undefined
  const hasLevel = opts.level !== undefined

  if (hasSeason !== hasLevel) {
    p.cancel(pc.red('Provide both --season and --level together, or omit both to use the active level.'))
    process.exit(EXIT_CODES.USAGE_ERROR)
  }

  if (hasSeason && hasLevel) {
    const season = Number.parseInt(opts.season ?? '', 10)
    const level = Number.parseInt(opts.level ?? '', 10)

    if (!Number.isFinite(season) || season <= 0) {
      p.cancel(pc.red(`Invalid season: ${opts.season}`))
      process.exit(EXIT_CODES.USAGE_ERROR)
    }
    if (!Number.isFinite(level) || level <= 0) {
      p.cancel(pc.red(`Invalid level: ${opts.level}`))
      process.exit(EXIT_CODES.USAGE_ERROR)
    }

    setCurrentLevel(`s${season}-l${level}`)

    return { season, level }
  }

  const current = getCurrentLevelCoordinates()
  if (!current) {
    p.cancel(
      pc.red('No active level selected. Run `pnpm game level <number> --season <number>` first, or pass --season and --level.')
    )
    process.exit(EXIT_CODES.USAGE_ERROR)
  }

  return current
}
