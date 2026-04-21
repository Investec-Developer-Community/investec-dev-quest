import type { Command } from 'commander'
import { existsSync, copyFileSync } from 'fs'
import chalk from 'chalk'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { getProgress, upsertProgress } from '../db/progress.js'
import * as readline from 'readline'
import { resolveLevelSelection } from './levelSelection.js'

export function registerResetCommand(program: Command): void {
  program
    .command('reset')
    .description('Reset solution.js to the original starter code for a level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (opts: { season?: string; level?: string; yes?: boolean }) => {
      const { season, level } = resolveLevelSelection(opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        console.error(chalk.red(`Level S${season}L${level} not found.`))
        process.exit(1)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath, starterPath } = resolved

      if (!existsSync(starterPath)) {
        console.error(chalk.red(`No starter code found at ${starterPath}`))
        process.exit(1)
      }

      if (!opts.yes) {
        const confirmed = await confirm(
          chalk.yellow(`Reset solution.js for "${manifest.name}" to starter code? `) +
            chalk.dim('(y/N) ')
        )
        if (!confirmed) {
          console.log(chalk.dim('Reset cancelled.'))
          return
        }
      }

      copyFileSync(starterPath, solutionPath)
      console.log(chalk.green('solution.js reset to starter code.'))

      // Mark as active again if it was complete
      const progress = getProgress(manifest.id)
      if (progress?.status === 'complete') {
        upsertProgress({
          ...progress,
          status: 'active',
          completedAt: null,
        })
        console.log(chalk.dim('Progress status reset to active.'))
      }
    })
}

function confirm(prompt: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}
