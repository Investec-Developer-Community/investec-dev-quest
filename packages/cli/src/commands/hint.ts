import type { Command } from 'commander'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { p, pc } from '../ui/theme.js'
import { renderMarkdown } from '../ui/markdown.js'
import { EXIT_CODES } from '@investec-game/shared'
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
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, hintsDir } = resolved

      if (!existsSync(hintsDir)) {
        p.log.warn(pc.yellow('No hints available for this level.'))
        return
      }

      const hintFiles = readdirSync(hintsDir)
        .filter((f) => f.endsWith('.md'))
        .sort()

      if (hintFiles.length === 0) {
        p.log.warn(pc.yellow('No hints available for this level.'))
        return
      }

      const unlocked = getUnlockedHints(manifest.id)

      if (opts.all) {
        if (unlocked.length === 0) {
          p.log.message(pc.dim('No hints unlocked yet. Run `pnpm game hint` to unlock the first one.'))
          return
        }
        for (const idx of unlocked) {
          const file = hintFiles[idx]
          if (file) {
            p.note(renderMarkdown(readFileSync(join(hintsDir, file), 'utf-8')), `Hint ${idx + 1}`)
          }
        }
        return
      }

      const nextIndex = unlocked.length

      if (nextIndex >= hintFiles.length) {
        p.log.warn(pc.yellow(`You've already unlocked all ${hintFiles.length} hint(s) for this level.`))
        p.log.message(pc.dim('Run with --all to review them.'))
        return
      }

      const file = hintFiles[nextIndex]
      if (!file) return

      recordHintUnlock(manifest.id, nextIndex)

      p.note(renderMarkdown(readFileSync(join(hintsDir, file), 'utf-8')), `Hint ${nextIndex + 1} of ${hintFiles.length}`)

      const remaining = hintFiles.length - nextIndex - 1
      if (remaining > 0) {
        p.log.message(pc.dim(`${remaining} more hint(s) available.`))
      }

      // Ensure progress row exists
      const progress = getProgress(manifest.id)
      if (!progress) {
        p.log.message(pc.dim(`Run \`pnpm game level ${level} --season ${season}\` first.`))
      }
    })
}
