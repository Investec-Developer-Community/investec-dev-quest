import type { Command } from 'commander'
import { existsSync, copyFileSync } from 'fs'
import { p, pc } from '../ui/theme.js'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { getProgress, upsertProgress } from '../db/progress.js'
import { isCancel } from '@clack/prompts'
import { resolveLevelSelection } from './levelSelection.js'

export function registerResetCommand(program: Command): void {
  program
    .command('reset')
    .description('Reset solution.js to the original starter code for a level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (opts: { season?: string; level?: string; yes?: boolean }) => {
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath, starterPath } = resolved

      if (!existsSync(starterPath)) {
        p.cancel(pc.red(`No starter code found at ${starterPath}`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      if (!opts.yes) {
        const confirmed = await p.confirm({
          message: `Reset solution.js for "${manifest.name}" to starter code?`,
        })
        if (isCancel(confirmed) || !confirmed) {
          p.cancel('Reset cancelled.')
          return
        }
      }

      copyFileSync(starterPath, solutionPath)
      p.log.success(pc.green('solution.js reset to starter code.'))

      // Mark as active again if it was complete
      const progress = getProgress(manifest.id)
      if (progress?.status === 'complete') {
        upsertProgress({
          ...progress,
          status: 'active',
          completedAt: null,
        })
        p.log.message(pc.dim('Progress status reset to active.'))
      }
    })
}
