import type { Command } from 'commander'
import chalk from 'chalk'
import { loadAllLevels } from '../levels/loader.js'
import { getAllProgress } from '../db/progress.js'

const STATUS_ICON: Record<string, string> = {
  locked: chalk.dim('○'),
  active: chalk.yellow('◑'),
  complete: chalk.green('●'),
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show progress across all levels')
    .action(() => {
      const levels = loadAllLevels()
      const allProgress = getAllProgress()
      const progressMap = new Map(allProgress.map((p) => [p.levelId, p]))

      if (levels.length === 0) {
        console.log(chalk.yellow('No levels found. Check the seasons/ directory.'))
        return
      }

      console.log(chalk.bold('\n Investec Developer Game — Progress\n'))

      let currentSeason = 0

      for (const level of levels) {
        if (level.manifest.season !== currentSeason) {
          currentSeason = level.manifest.season
          console.log(chalk.bold(`  Season ${currentSeason}`))
        }

        const progress = progressMap.get(level.manifest.id)
        const status = progress?.status ?? 'locked'
        const icon = STATUS_ICON[status] ?? chalk.dim('?')
        const attempts = progress ? ` (${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'})` : ''
        const hints = progress?.hintsUsed ? chalk.dim(` [${progress.hintsUsed} hint${progress.hintsUsed === 1 ? '' : 's'}]`) : ''
        const completedAt = progress?.completedAt
          ? chalk.dim(` ✓ ${new Date(progress.completedAt).toLocaleDateString()}`)
          : ''

        const difficulty = chalk.dim(`[${level.manifest.difficulty}]`)
        const name = status === 'complete' ? chalk.dim(level.manifest.name) : chalk.white(level.manifest.name)

        console.log(
          `  ${icon}  L${level.manifest.level} ${name} ${difficulty}${attempts}${hints}${completedAt}`
        )
      }

      const complete = allProgress.filter((p) => p.status === 'complete').length
      console.log(chalk.dim(`\n  ${complete}/${levels.length} levels complete\n`))
    })
}
