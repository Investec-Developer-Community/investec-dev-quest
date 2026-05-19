import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { loadAllLevels } from '../levels/loader.js'
import { getAllCaseFiles, getAllProgress } from '../db/progress.js'
import { getOperationalRiskProfile, hasOperationalRiskEvidence } from '../services/operationalRisk.js'
import { buildCompletionSummary, playerTitle } from '../services/certificate.js'

const STATUS_ICON: Record<string, string> = {
  locked: pc.dim('○'),
  active: pc.yellow('◑'),
  complete: pc.green('●'),
}

const SEASON_NAMES: Record<number, string> = {
  1: 'API Foundations',
  2: 'Card Code & Rules Engine',
  3: 'Secure Fintech Workflows',
  4: 'Intelligent Banking Automation',
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
})

function buildSeasonTotals(
  levels: ReturnType<typeof loadAllLevels>,
  progressMap: Map<string, ReturnType<typeof getAllProgress>[number]>
): Map<number, { complete: number; total: number }> {
  const seasonTotals = new Map<number, { complete: number; total: number }>()

  for (const level of levels) {
    const current = seasonTotals.get(level.manifest.season) ?? { complete: 0, total: 0 }
    const progress = progressMap.get(level.manifest.id)
    current.total += 1
    if (progress?.status === 'complete') current.complete += 1
    seasonTotals.set(level.manifest.season, current)
  }

  return seasonTotals
}

function formatCompletionDate(completedAt?: string | null): string {
  if (!completedAt) {
    return ''
  }

  return pc.dim(` ✓ ${DATE_FORMATTER.format(new Date(completedAt))}`)
}

function formatLevelLine(
  level: ReturnType<typeof loadAllLevels>[number],
  progress: ReturnType<typeof getAllProgress>[number] | undefined
): string {
  const status = progress?.status ?? 'locked'
  const icon = STATUS_ICON[status] ?? pc.dim('?')
  const attempts = progress ? ` (${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'})` : ''
  const hints = progress?.hintsUsed ? pc.dim(` [${progress.hintsUsed} hint${progress.hintsUsed === 1 ? '' : 's'}]`) : ''
  const badges = [
    status === 'complete' && progress?.hintsUsed === 0 ? pc.green('no-hint') : null,
    status === 'complete' && progress && progress.attempts <= 2 ? pc.green('low-attempt') : null,
  ].filter((badge): badge is string => badge !== null)
  const badge = badges.length > 0 ? ` ${badges.join(' ')}` : ''
  const completedAt = formatCompletionDate(progress?.completedAt)

  const difficulty = pc.dim(`[${level.manifest.difficulty}]`)
  const boss = level.manifest.boss ? pc.magenta('[boss]') : ''
  const name = status === 'complete' ? pc.dim(level.manifest.name) : level.manifest.name

  return `${icon}  L${level.manifest.level} ${name} ${difficulty}${boss ? ` ${boss}` : ''}${attempts}${hints}${badge}${completedAt}`
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show progress across all levels')
    .action(() => {
      const levels = loadAllLevels()
      const allProgress = getAllProgress()
      const progressMap = new Map(allProgress.map((pr) => [pr.levelId, pr]))
      const seasonTotals = buildSeasonTotals(levels, progressMap)

      if (levels.length === 0) {
        p.log.warn(pc.yellow('No levels found. Check the seasons/ directory.'))
        return
      }

      showBanner()

      let currentSeason = 0

      for (const level of levels) {
        if (level.manifest.season !== currentSeason) {
          currentSeason = level.manifest.season
          const seasonName = SEASON_NAMES[currentSeason]
          const seasonProgress = seasonTotals.get(currentSeason)
          const seasonBadge = seasonProgress && seasonProgress.complete === seasonProgress.total
            ? pc.green(' complete')
            : ''
          const seasonCount = seasonProgress
            ? pc.dim(` (${seasonProgress.complete}/${seasonProgress.total})`)
            : ''
          p.log.step(pc.bold(`Season ${currentSeason}${seasonName ? ` — ${seasonName}` : ''}`) + seasonCount + seasonBadge)
        }

        const progress = progressMap.get(level.manifest.id)
        p.log.message(formatLevelLine(level, progress))
      }

      const summary = buildCompletionSummary(levels, allProgress)
      const complete = summary.complete
      p.log.message(pc.dim(`\n${complete}/${levels.length} levels complete`))
      p.log.message(pc.dim(`XP: ${summary.totalXp}/${summary.maxXp}`))

      if (complete === 0) {
        p.log.message(pc.cyan('Start here: pnpm game level 1 --season 1'))
      }
      p.log.message(pc.dim('Recommended next: pnpm game map'))

      if (hasOperationalRiskEvidence()) {
        const riskProfile = getOperationalRiskProfile()
        const riskTone = riskProfile.band === 'elevated'
          ? pc.red
          : riskProfile.band === 'guarded'
            ? pc.yellow
            : pc.green
        p.log.message(pc.dim('Carry-forward operational risk: ') + riskTone(riskProfile.band))
      } else {
        p.log.message(pc.dim('Carry-forward operational risk: not assessed yet'))
      }

      if (complete > 0) {
        p.log.message(pc.dim('Review completed level references with `pnpm game reference --season <n> --level <n>`.'))
      }

      const caseFiles = getAllCaseFiles()
      if (caseFiles.length > 0) {
        const latest = caseFiles.slice(0, 3)
        const lines = [pc.yellow(pc.bold('Recent case files')), '']
        for (const entry of latest) {
          lines.push(`- S${entry.season}L${entry.level} ${entry.levelName}: ${entry.adversaryBlocked}`)
          lines.push(pc.dim(`  ${entry.downstreamConsequence}`))
        }
        if (caseFiles.length > latest.length) {
          lines.push('')
          lines.push(pc.dim(`Showing ${latest.length}/${caseFiles.length} case files.`))
        }
        p.note(lines.join('\n'), pc.yellow('Case Files'))
      }

      if (complete === levels.length) {
        p.note(
          [
            pc.green(pc.bold(`${complete}/${levels.length} missions complete`)),
            `Title: ${playerTitle(summary)}`,
            `Total XP: ${summary.totalXp}/${summary.maxXp}`,
            `No-hint solves: ${summary.noHintSolves}`,
            `Low-attempt solves: ${summary.lowAttemptSolves}`,
            '',
            pc.cyan('Run `pnpm game certificate` and open the swag claim issue.'),
          ].join('\n'),
          pc.green('Campaign Complete')
        )
      }
    })
}
