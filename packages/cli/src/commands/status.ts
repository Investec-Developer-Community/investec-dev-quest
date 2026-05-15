import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { loadAllLevels } from '../levels/loader.js'
import { getAllProgress } from '../db/progress.js'
import { getOperationalRiskProfile, hasOperationalRiskEvidence } from '../services/operationalRisk.js'

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

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show progress across all levels')
    .action(() => {
      const levels = loadAllLevels()
      const allProgress = getAllProgress()
      const progressMap = new Map(allProgress.map((pr) => [pr.levelId, pr]))
      const seasonTotals = new Map<number, { complete: number; total: number }>()

      if (levels.length === 0) {
        p.log.warn(pc.yellow('No levels found. Check the seasons/ directory.'))
        return
      }

      for (const level of levels) {
        const current = seasonTotals.get(level.manifest.season) ?? { complete: 0, total: 0 }
        const progress = progressMap.get(level.manifest.id)
        current.total += 1
        if (progress?.status === 'complete') current.complete += 1
        seasonTotals.set(level.manifest.season, current)
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
        const status = progress?.status ?? 'locked'
        const icon = STATUS_ICON[status] ?? pc.dim('?')
        const attempts = progress ? ` (${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'})` : ''
        const hints = progress?.hintsUsed ? pc.dim(` [${progress.hintsUsed} hint${progress.hintsUsed === 1 ? '' : 's'}]`) : ''
        const badges = [
          status === 'complete' && progress?.hintsUsed === 0 ? pc.green('no-hint') : null,
          status === 'complete' && progress && progress.attempts <= 2 ? pc.green('low-attempt') : null,
        ].filter((badge): badge is string => badge !== null)
        const badge = badges.length > 0 ? ` ${badges.join(' ')}` : ''
        const completedAt = progress?.completedAt
          ? pc.dim(` ✓ ${new Date(progress.completedAt).toLocaleDateString()}`)
          : ''

        const difficulty = pc.dim(`[${level.manifest.difficulty}]`)
        const boss = level.manifest.boss ? pc.magenta('[boss]') : ''
        const name = status === 'complete' ? pc.dim(level.manifest.name) : level.manifest.name

        p.log.message(
          `${icon}  L${level.manifest.level} ${name} ${difficulty}${boss ? ` ${boss}` : ''}${attempts}${hints}${badge}${completedAt}`
        )
      }

      const complete = allProgress.filter((pr) => pr.status === 'complete').length
      p.log.message(pc.dim(`\n${complete}/${levels.length} levels complete`))

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
    })
}
