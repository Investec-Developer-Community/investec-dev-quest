import type { Command } from 'commander'
import { existsSync, readFileSync, copyFileSync, mkdirSync } from 'fs'
import chalk from 'chalk'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { getProgress, upsertProgress, setCurrentLevel } from '../db/progress.js'

export function registerLevelCommand(program: Command): void {
  program
    .command('level <number>')
    .description('Load a level — prints the story and initialises your solution file')
    .option('-s, --season <n>', 'Season number (defaults to 1)', '1')
    .action((levelNum: string, opts: { season: string }) => {
      const season = parseInt(opts.season, 10)
      const level = parseInt(levelNum, 10)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        console.error(chalk.red(`Level S${season}L${level} not found.`))
        console.error(chalk.dim(`Looked in: seasons/season-${season}/level-${level}`))
        process.exit(1)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, storyPath, solutionPath, starterPath } = resolved

      // Print story
      if (existsSync(storyPath)) {
        console.log('\n' + readFileSync(storyPath, 'utf-8'))
      }

      // Initialise solution.js from starter only if not already started
      let progress = getProgress(manifest.id)
      if (!existsSync(solutionPath)) {
        if (!existsSync(starterPath)) {
          console.error(chalk.red(`No starter code found at ${starterPath}`))
          process.exit(1)
        }
        mkdirSync(levelDir, { recursive: true })
        copyFileSync(starterPath, solutionPath)
        console.log(chalk.cyan(`\n→ Starter code copied to: ${chalk.bold(solutionPath)}`))
      } else {
        console.log(chalk.dim(`\n→ solution.js already exists at: ${solutionPath} — resuming previous work`))
      }

      // Record progress
      if (!progress) {
        progress = {
          levelId: manifest.id,
          status: 'active',
          attempts: 0,
          hintsUsed: 0,
          startedAt: new Date().toISOString(),
          completedAt: null,
        }
        upsertProgress(progress)
      } else if (progress.status === 'locked') {
        upsertProgress({ ...progress, status: 'active', startedAt: new Date().toISOString() })
      }

      // Persist "currently selected" level for commands that omit --season/--level.
      setCurrentLevel(manifest.id)

      console.log(
        chalk.bold.white(`\nLevel: ${manifest.name}`) +
          chalk.dim(` (S${manifest.season} L${manifest.level} — ${manifest.difficulty})`)
      )
      console.log(chalk.dim(`\nEdit ${solutionPath} then run: `) + chalk.cyan('pnpm game test'))
      if (manifest.apiRequired) {
        console.log(
          chalk.dim('This level uses the mock Investec API — it will start automatically.')
        )
      }
    })
}
