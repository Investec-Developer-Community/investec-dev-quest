import type { Command } from 'commander'
import { existsSync, readFileSync, copyFileSync, mkdirSync } from 'fs'
import { p, pc, showBanner } from '../ui/theme.js'
import { EXIT_CODES } from '@investec-game/shared'
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
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        p.log.message(pc.dim(`Looked in: seasons/season-${season}/level-${level}`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, storyPath, solutionPath, starterPath } = resolved

      showBanner()

      // Print story
      if (existsSync(storyPath)) {
        p.note(readFileSync(storyPath, 'utf-8'), pc.bold(manifest.name))
      }

      // Initialise solution.js from starter only if not already started
      let progress = getProgress(manifest.id)
      if (!existsSync(solutionPath)) {
        if (!existsSync(starterPath)) {
          p.cancel(pc.red(`No starter code found at ${starterPath}`))
          process.exit(EXIT_CODES.USAGE_ERROR)
        }
        mkdirSync(levelDir, { recursive: true })
        copyFileSync(starterPath, solutionPath)
        p.log.success(pc.cyan(`→ Starter code copied to: ${pc.bold(solutionPath)}`))
      } else {
        p.log.message(pc.dim(`→ solution.js already exists at: ${solutionPath} — resuming previous work`))
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

      p.log.step(
        pc.bold(`Level: ${manifest.name}`) +
          pc.dim(` (S${manifest.season} L${manifest.level} — ${manifest.difficulty})`)
      )
      p.log.info(pc.dim(`Edit ${solutionPath} then run: `) + pc.cyan('pnpm game test'))
      if (manifest.apiRequired) {
        p.log.message(
          pc.dim('This level uses the mock Investec API — it will start automatically.')
        )
      }
    })
}
