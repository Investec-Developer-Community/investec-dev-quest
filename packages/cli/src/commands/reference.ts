import type { Command } from 'commander'
import { existsSync, readFileSync } from 'fs'
import chalk from 'chalk'
import boxen from 'boxen'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { getProgress } from '../db/progress.js'
import { resolveLevelSelection } from './levelSelection.js'

export function registerReferenceCommand(program: Command): void {
  program
    .command('reference')
    .description('Show the reference solution for a completed level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('--no-debrief', 'Only show the reference code, even if a debrief exists')
    .action((opts: { season?: string; level?: string; debrief?: boolean }) => {
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        program.error(chalk.red(`Level S${season}L${level} not found.`), {
          exitCode: EXIT_CODES.USAGE_ERROR,
          code: 'game.reference.not-found',
        })
      }

      const resolved = loadLevel(levelDir)
      const { manifest, referencePath, debriefPath } = resolved
      const progress = getProgress(manifest.id)

      if (progress?.status !== 'complete') {
        console.log(
          boxen(
            [
              chalk.yellow.bold('Reference locked'),
              '',
              chalk.white(`Complete "${manifest.name}" before viewing the reference solution.`),
              '',
              chalk.dim('Run `pnpm game test` until both behavior tests and the attack script pass.'),
              chalk.dim('Use `pnpm game hint` if you want a nudge.'),
            ].join('\n'),
            {
              padding: 1,
              borderColor: 'yellow',
            }
          )
        )
        return
      }

      if (!existsSync(referencePath)) {
        program.error(chalk.red(`No reference solution found at ${referencePath}`), {
          exitCode: EXIT_CODES.USAGE_ERROR,
          code: 'game.reference.missing',
        })
      }

      console.log(
        boxen(
          [
            chalk.green.bold(`Reference: ${manifest.name}`),
            chalk.dim(`S${manifest.season} L${manifest.level} — ${manifest.difficulty}`),
          ].join('\n'),
          {
            padding: 1,
            borderColor: 'green',
          }
        )
      )

      console.log(chalk.bold('\nreference/solution.js\n'))
      console.log(readFileSync(referencePath, 'utf-8'))

      if (opts.debrief !== false && existsSync(debriefPath)) {
        console.log(chalk.bold('\nDebrief\n'))
        console.log(readFileSync(debriefPath, 'utf-8'))
      } else if (opts.debrief !== false) {
        console.log(chalk.dim('\nNo debrief.md exists for this level yet.'))
      }
    })
}