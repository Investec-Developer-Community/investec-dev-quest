import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { loadAllLevels, type ResolvedLevel } from '../levels/loader.js'
import { getActivity, getAllProgress, getCurrentLevelId } from '../db/progress.js'
import { buildCompletionSummary, playerTitle } from '../services/certificate.js'
import { resolveNextMission } from '../services/paths.js'
import { nearestBadge } from '../services/milestones.js'
import { activeStreak, daysSince, describeLastPlayed } from '../services/activity.js'
import { loadLevelForPlay } from './level.js'

function play(level: ResolvedLevel): void {
  loadLevelForPlay(level.manifest.season, level.manifest.level, { banner: false })
  p.outro(pc.dim('Stuck? `pnpm game hint`  ·  Progress: `pnpm game status`  ·  All routes: `pnpm game map`'))
}

export function registerStartCommand(program: Command): void {
  program
    .command('start')
    .description('Start or continue the campaign (default when no command is given)')
    .action(() => {
      const levels = loadAllLevels()
      const progress = getAllProgress()
      const summary = buildCompletionSummary(levels, progress)
      const next = resolveNextMission(levels, progress)

      showBanner()

      if (progress.length === 0 && next) {
        p.note(
          [
            pc.bold('Welcome to the Investec Developer Response Cell.'),
            '',
            'Every mission is a broken FinFlow integration. Fix `solution.js` so the',
            'behavior tests pass and the Red Team exploit is blocked. Both must pass.',
            '',
            pc.cyan(`Induction: ${next.level.manifest.name} (${next.path.name} 1/${next.total}).`),
          ].join('\n'),
          pc.yellow('Briefing Desk')
        )
        play(next.level)
        return
      }

      const activity = getActivity()
      const lines = [
        `${summary.complete}/${summary.total} missions complete  ·  XP: ${summary.totalXp}/${summary.maxXp}  ·  Rank: ${playerTitle(summary)}`,
      ]
      if (activity) {
        const streak = activeStreak(activity)
        const days = daysSince(activity)
        lines.push(`Last played ${describeLastPlayed(days)}.`)
        lines.push(
          streak === 0
            ? `Your streak has reset (best ${activity.bestStreak}). Run a test today to start a new one.`
            : days === 0
              ? `Daily streak: ${streak} day${streak === 1 ? '' : 's'} (best ${activity.bestStreak}). Today already counts.`
              : `Daily streak: ${streak} day${streak === 1 ? '' : 's'} (best ${activity.bestStreak}). Run a test today to keep it going.`
        )
      }
      const badge = nearestBadge(levels, progress)
      if (badge) {
        lines.push(`${badge.remaining} mission${badge.remaining === 1 ? '' : 's'} to finish ${badge.source} and earn ${pc.magenta(badge.name)}.`)
      }
      p.note(lines.join('\n'), pc.yellow('Welcome back, responder'))

      const currentId = getCurrentLevelId()
      const current = levels.find((level) => level.manifest.id === currentId)
      const currentStatus = progress.find((entry) => entry.levelId === currentId)?.status
      if (current && currentStatus !== 'complete') {
        p.log.step(pc.bold(`Resuming: ${current.manifest.name}`))
        play(current)
        return
      }

      if (!next) {
        p.note(
          [
            pc.green(pc.bold(`${summary.complete}/${summary.total} missions complete`)),
            '',
            pc.cyan('Run `pnpm game certificate` and open the swag claim issue.'),
          ].join('\n'),
          pc.green('Campaign Complete')
        )
        return
      }

      p.log.step(pc.bold(`Next mission: ${next.level.manifest.name}`) + pc.dim(` (${next.path.name} ${next.complete}/${next.total})`))
      play(next.level)
    })
}
