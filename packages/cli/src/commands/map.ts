import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { getAllProgress } from '../db/progress.js'
import { loadAllLevels } from '../levels/loader.js'
import { GAME_PATHS, levelCommand, summarizePathProgress } from '../services/paths.js'

export function registerMapCommand(program: Command): void {
  program
    .command('map')
    .description('Show recommended quest paths and the next mission for each path')
    .action(() => {
      const levels = loadAllLevels()
      const progress = getAllProgress()

      showBanner()
      p.log.step(pc.bold('Quest Map'))
      p.log.message(pc.dim('Choose a path, clear the next incomplete mission, then come back for the next route marker.'))

      for (const path of GAME_PATHS) {
        const summary = summarizePathProgress(path, levels, progress)
        const complete = summary.complete === summary.total
        const title = complete
          ? pc.green(`${path.name} (${summary.complete}/${summary.total}) complete`)
          : pc.bold(`${path.name} ${pc.dim(`(${summary.complete}/${summary.total})`)}`)
        const levelList = path.levelIds.map((id) => id.toUpperCase().replace('-', '')).join(', ')
        const next = summary.nextLevel
          ? pc.cyan(`Next: ${levelCommand(summary.nextLevel)}`)
          : pc.green('Path complete')

        p.note(
          [
            path.description,
            '',
            pc.dim(`Levels: ${levelList}`),
            next,
          ].join('\n'),
          title
        )
      }
    })
}

