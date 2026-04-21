import type { Command } from 'commander'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { getProgress, recordHintUnlock, getUnlockedHints } from '../db/progress.js'
import { resolveLevelSelection } from './levelSelection.js'

export function registerHintCommand(program: Command): void {
  program
    .command('hint')
    .description('Reveal the next hint for the active level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('--all', 'Show all previously unlocked hints')
    .action((opts: { season?: string; level?: string; all?: boolean }) => {
      const { season, level } = resolveLevelSelection(opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        console.error(chalk.red(`Level S${season}L${level} not found.`))
        process.exit(1)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, hintsDir } = resolved

      if (!existsSync(hintsDir)) {
        console.log(chalk.yellow('No hints available for this level.'))
        return
      }

      const hintFiles = readdirSync(hintsDir)
        .filter((f) => f.endsWith('.md'))
        .sort()

      if (hintFiles.length === 0) {
        console.log(chalk.yellow('No hints available for this level.'))
        return
      }

      const unlocked = getUnlockedHints(manifest.id)

      if (opts.all) {
        if (unlocked.length === 0) {
          console.log(chalk.dim('No hints unlocked yet. Run `investec-game hint` to unlock the first one.'))
          return
        }
        for (const idx of unlocked) {
          const file = hintFiles[idx]
          if (file) {
            console.log(chalk.bold(`\nHint ${idx + 1}:`))
            console.log(readFileSync(join(hintsDir, file), 'utf-8'))
          }
        }
        return
      }

      const nextIndex = unlocked.length

      if (nextIndex >= hintFiles.length) {
        console.log(chalk.yellow(`You've already unlocked all ${hintFiles.length} hint(s) for this level.`))
        console.log(chalk.dim('Run with --all to review them.'))
        return
      }

      const file = hintFiles[nextIndex]
      if (!file) return

      recordHintUnlock(manifest.id, nextIndex)

      console.log(chalk.bold(`\nHint ${nextIndex + 1} of ${hintFiles.length}:`))
      console.log(readFileSync(join(hintsDir, file), 'utf-8'))

      const remaining = hintFiles.length - nextIndex - 1
      if (remaining > 0) {
        console.log(chalk.dim(`\n${remaining} more hint(s) available.`))
      }

      // Ensure progress row exists
      const progress = getProgress(manifest.id)
      if (!progress) {
        console.log(chalk.dim(`\nRun \`investec-game level ${level} --season ${season}\` first.`))
      }
    })
}
