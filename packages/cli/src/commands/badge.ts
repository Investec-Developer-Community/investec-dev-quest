import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { loadAllLevels } from '../levels/loader.js'
import { getAllProgress } from '../db/progress.js'
import { buildCompletionSummary, playerTitle } from '../services/certificate.js'
import { buildBadgeShareText, listBadges } from '../services/milestones.js'

export function registerBadgeCommand(program: Command): void {
  program
    .command('badge')
    .description('Show earned path and season badges, with share text for each')
    .action(() => {
      const levels = loadAllLevels()
      const progress = getAllProgress()
      const summary = buildCompletionSummary(levels, progress)
      const badges = listBadges(levels, progress)
      const earned = badges.filter((badge) => badge.earned)
      const locked = badges.filter((badge) => !badge.earned)

      showBanner()
      p.log.step(pc.bold(`Rank: ${playerTitle(summary)}`) + pc.dim(`  ·  ${earned.length}/${badges.length} badges`))

      for (const badge of earned) {
        p.note(
          [
            pc.green(pc.bold(badge.name)),
            pc.dim(`${badge.source}: ${badge.total}/${badge.total} missions`),
            '',
            pc.dim('Share text:'),
            buildBadgeShareText(badge),
          ].join('\n'),
          pc.magenta('Badge Earned')
        )
      }

      if (locked.length > 0) {
        const lines = locked.map((badge) => `${pc.dim('○')} ${badge.name} ${pc.dim(`(${badge.source}: ${badge.complete}/${badge.total})`)}`)
        p.note(lines.join('\n'), pc.dim('Locked Badges'))
      }

      if (earned.length === 0) {
        p.outro(pc.cyan('Finish the Quickstart Path to earn your first badge: pnpm game'))
      }
    })
}
