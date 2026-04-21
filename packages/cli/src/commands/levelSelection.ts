import chalk from 'chalk'
import { getCurrentLevelCoordinates, setCurrentLevel } from '../db/progress.js'

interface LevelSelectionOptions {
  season?: string
  level?: string
}

interface LevelSelection {
  season: number
  level: number
}

export function resolveLevelSelection(opts: LevelSelectionOptions): LevelSelection {
  const hasSeason = opts.season !== undefined
  const hasLevel = opts.level !== undefined

  if (hasSeason !== hasLevel) {
    console.error(
      chalk.red('Provide both --season and --level together, or omit both to use the active level.')
    )
    process.exit(1)
  }

  if (hasSeason && hasLevel) {
    const season = Number.parseInt(opts.season ?? '', 10)
    const level = Number.parseInt(opts.level ?? '', 10)

    if (!Number.isFinite(season) || season <= 0) {
      console.error(chalk.red(`Invalid season: ${opts.season}`))
      process.exit(1)
    }
    if (!Number.isFinite(level) || level <= 0) {
      console.error(chalk.red(`Invalid level: ${opts.level}`))
      process.exit(1)
    }

    setCurrentLevel(`s${season}-l${level}`)

    return { season, level }
  }

  const current = getCurrentLevelCoordinates()
  if (!current) {
    console.error(
      chalk.red(
        'No active level selected. Run `investec-game level <number> --season <number>` first, or pass --season and --level.'
      )
    )
    process.exit(1)
  }

  return current
}
