import type { Command } from 'commander'
import chalk from 'chalk'
import { loadAllLevels } from '../levels/loader.js'
import { getAllProgress } from '../db/progress.js'

const STATUS_ICON: Record<string, string> = {
  locked: chalk.dim('○'),
  active: chalk.yellow('◑'),
  complete: chalk.green('●'),
}

const SEASON_NAMES: Record<number, string> = {
  1: 'API Foundations',
  2: 'Card Code & Rules Engine',
  3: 'Secure Fintech Workflows',
  4: 'Intelligent Banking Automation',
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show progress across all levels')
    .action(() => {
      const levels = loadAllLevels()
      const allProgress = getAllProgress()
      const progressMap = new Map(allProgress.map((p) => [p.levelId, p]))
      const seasonTotals = new Map<number, { complete: number; total: number }>()

      if (levels.length === 0) {
        console.log(chalk.yellow('No levels found. Check the seasons/ directory.'))
        return
      }

      for (const level of levels) {
        const current = seasonTotals.get(level.manifest.season) ?? { complete: 0, total: 0 }
        const progress = progressMap.get(level.manifest.id)
        current.total += 1
        if (progress?.status === 'complete') current.complete += 1
        seasonTotals.set(level.manifest.season, current)
      }

      console.log(chalk.bold('\n Investec Developer Game — Progress\n'))

      let currentSeason = 0

      for (const level of levels) {
        if (level.manifest.season !== currentSeason) {
          currentSeason = level.manifest.season
          const seasonName = SEASON_NAMES[currentSeason]
          const seasonProgress = seasonTotals.get(currentSeason)
          const seasonBadge = seasonProgress && seasonProgress.complete === seasonProgress.total
            ? chalk.green(' complete')
            : ''
          const seasonCount = seasonProgress
            ? chalk.dim(` (${seasonProgress.complete}/${seasonProgress.total})`)
            : ''
          console.log(chalk.bold(`  Season ${currentSeason}${seasonName ? ` — ${seasonName}` : ''}`) + seasonCount + seasonBadge)
        }

        const progress = progressMap.get(level.manifest.id)
        const status = progress?.status ?? 'locked'
        const icon = STATUS_ICON[status] ?? chalk.dim('?')
        const attempts = progress ? ` (${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'})` : ''
        const hints = progress?.hintsUsed ? chalk.dim(` [${progress.hintsUsed} hint${progress.hintsUsed === 1 ? '' : 's'}]`) : ''
        const badges = [
          status === 'complete' && progress?.hintsUsed === 0 ? chalk.green('no-hint') : null,
          status === 'complete' && progress && progress.attempts <= 2 ? chalk.green('low-attempt') : null,
        ].filter((badge): badge is string => badge !== null)
        const badge = badges.length > 0 ? ` ${badges.join(' ')}` : ''
        const completedAt = progress?.completedAt
          ? chalk.dim(` ✓ ${new Date(progress.completedAt).toLocaleDateString()}`)
          : ''

        const difficulty = chalk.dim(`[${level.manifest.difficulty}]`)
        const name = status === 'complete' ? chalk.dim(level.manifest.name) : chalk.white(level.manifest.name)

        console.log(
          `  ${icon}  L${level.manifest.level} ${name} ${difficulty}${attempts}${hints}${badge}${completedAt}`
        )
      }

      const complete = allProgress.filter((p) => p.status === 'complete').length
      console.log(chalk.dim(`\n  ${complete}/${levels.length} levels complete\n`))

      if (complete > 0) {
        console.log(chalk.dim('  Review completed level references with `pnpm game reference --season <n> --level <n>`.\n'))
      }
    })
}
