import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { renderMarkdown } from '../ui/markdown.js'
import { getArcFlagEvidence, getArcFlags, getCurrentLevelId, parseLevelId } from '../db/progress.js'
import type { ArcFlagKey } from '@investec-game/shared'
import { ARC_DEFAULT_FLAGS } from '../services/arcModel.js'
import { buildArcPostmortemAddendum } from '../services/arcPostmortem.js'
import { buildIncidentVisibilityAddendumForSeason } from '../services/incidentVisibility.js'
import { buildBeneficiaryIncidentChainAddendumForLevel } from '../services/beneficiaryIncidentChain.js'
import { buildOperationalRiskAddendumForSeason } from '../services/operationalRisk.js'

function formatChoiceLine(flag: ArcFlagKey, value: string, changed: boolean): string {
  const marker = changed ? pc.cyan('recorded') : pc.dim('baseline')
  return `- ${flag}: ${pc.bold(value)} ${marker}`
}

export function registerJournalCommand(program: Command): void {
  program
    .command('journal')
    .description('Show recorded arc choices, evidence, and downstream consequence summaries')
    .option('-r, --recent <n>', 'Number of recent evidence entries to show', '12')
    .option('-a, --all-evidence', 'Show all evidence entries instead of a recent subset')
    .action((opts: { recent: string; allEvidence?: boolean }) => {
      const parsedRecent = Number.parseInt(opts.recent, 10)
      const recentLimit = Number.isFinite(parsedRecent) && parsedRecent > 0 ? parsedRecent : 12

      const arcFlags = getArcFlags()
      const evidence = getArcFlagEvidence().sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
      const currentLevelId = getCurrentLevelId()
      const currentCoords = currentLevelId ? parseLevelId(currentLevelId) : null
      const seasonContext = currentCoords?.season ?? 4

      showBanner()

      p.log.step(pc.bold('Arc Journal'))
      p.log.message(pc.dim('A narrative trace of choices recorded from your test outcomes.'))

      const flagKeys = Object.keys(arcFlags) as ArcFlagKey[]
      const changedFlags = flagKeys.filter((flag) => arcFlags[flag] !== ARC_DEFAULT_FLAGS[flag])
      const baselineFlags = flagKeys.filter((flag) => arcFlags[flag] === ARC_DEFAULT_FLAGS[flag])

      const choiceLines = [
        pc.cyan(pc.bold('Choices recorded')),
        '',
        ...changedFlags.map((flag) => formatChoiceLine(flag, String(arcFlags[flag]), true)),
      ]

      if (changedFlags.length === 0) {
        choiceLines.push('- No non-baseline choices recorded yet. Run pnpm game test on levels with rubric signals.')
      }

      if (baselineFlags.length > 0) {
        choiceLines.push('')
        choiceLines.push(pc.dim(`Baseline flags still unchanged: ${baselineFlags.length}`))
      }

      p.note(choiceLines.join('\n'), pc.cyan('Choices'))

      const evidenceRows = opts.allEvidence ? evidence : evidence.slice(0, recentLimit)
      const evidenceLines = [pc.yellow(pc.bold('Evidence trail')), '']

      if (evidenceRows.length === 0) {
        evidenceLines.push('- No evidence written yet. Signals are written after running pnpm game test.')
      } else {
        for (const row of evidenceRows) {
          const signals = row.testSignals.length > 0 ? row.testSignals.join(', ') : 'none'
          evidenceLines.push(`- ${row.writtenAt} | ${row.levelId} | ${row.flag}=${row.value}`)
          evidenceLines.push(pc.dim(`  signals: ${signals}`))
        }
      }

      if (!opts.allEvidence && evidence.length > recentLimit) {
        evidenceLines.push('')
        evidenceLines.push(pc.dim(`Showing ${recentLimit}/${evidence.length}. Use pnpm game journal --all-evidence to show full trail.`))
      }

      p.note(evidenceLines.join('\n'), pc.yellow('Evidence'))

      const addenda = [
        buildArcPostmortemAddendum(),
        buildIncidentVisibilityAddendumForSeason(seasonContext),
        buildBeneficiaryIncidentChainAddendumForLevel(seasonContext, false),
        buildOperationalRiskAddendumForSeason(seasonContext),
      ].filter((content): content is string => Boolean(content))

      if (addenda.length === 0) {
        p.note('No downstream consequence summaries available yet. Record choices first.', pc.magenta('Consequences'))
      } else {
        p.log.step(pc.bold('Downstream consequences'))
        for (const content of addenda) {
          console.log(renderMarkdown(content))
          console.log('')
        }
      }

      p.outro(pc.green('Journal complete.'))
    })
}