import type { Command } from 'commander'
import { existsSync, readFileSync } from 'fs'
import { p, pc } from '../ui/theme.js'
import { renderMarkdown } from '../ui/markdown.js'
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
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, referencePath, debriefPath } = resolved
      const progress = getProgress(manifest.id)

      if (progress?.status !== 'complete') {
        p.note(
          [
            `Complete "${manifest.name}" before viewing the reference solution.`,
            '',
            pc.dim('Run `pnpm game test` until both behavior tests and the attack script pass.'),
            pc.dim('Use `pnpm game hint` if you want a nudge.'),
          ].join('\n'),
          pc.yellow(pc.bold('Reference locked'))
        )
        return
      }

      if (!existsSync(referencePath)) {
        p.cancel(pc.red(`No reference solution found at ${referencePath}`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      p.note(
        [
          pc.green(pc.bold(`Reference: ${manifest.name}`)),
          pc.dim(`S${manifest.season} L${manifest.level} — ${manifest.difficulty}`),
        ].join('\n'),
        pc.green(manifest.name)
      )

      p.log.step(pc.bold('reference/solution.js'))
      console.log(readFileSync(referencePath, 'utf-8'))

      if (opts.debrief !== false && existsSync(debriefPath)) {
        p.log.step(pc.bold('Debrief'))
        console.log(renderMarkdown(readFileSync(debriefPath, 'utf-8')))
      } else if (opts.debrief !== false) {
        p.log.message(pc.dim('No debrief.md exists for this level yet.'))
      }
    })
}