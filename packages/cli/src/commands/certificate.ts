import type { Command } from 'commander'
import { p, pc, showBanner } from '../ui/theme.js'
import { getAllProgress } from '../db/progress.js'
import { loadAllLevels } from '../levels/loader.js'
import { buildCertificateText, buildCompletionSummary, playerTitle } from '../services/certificate.js'
import { levelCommand } from '../services/paths.js'

export function registerCertificateCommand(program: Command): void {
  program
    .command('certificate')
    .description('Print a shareable completion certificate after all missions are complete')
    .action(() => {
      const levels = loadAllLevels()
      const progress = getAllProgress()
      const summary = buildCompletionSummary(levels, progress)

      showBanner()

      if (summary.complete < summary.total) {
        const remaining = summary.remainingLevels.slice(0, 8)
        const lines = [
          `${summary.complete}/${summary.total} missions complete.`,
          '',
          'Remaining missions:',
          ...remaining.map((level) => `- S${level.manifest.season}L${level.manifest.level}: ${level.manifest.name}`),
        ]

        if (summary.remainingLevels.length > remaining.length) {
          lines.push(pc.dim(`...and ${summary.remainingLevels.length - remaining.length} more.`))
        }

        const next = summary.remainingLevels[0]
        if (next) {
          lines.push('')
          lines.push(pc.cyan(`Next: ${levelCommand(next)}`))
        }

        p.note(lines.join('\n'), pc.yellow('Certificate Locked'))
        return
      }

      p.note(
        [
          pc.green(pc.bold(playerTitle(summary))),
          pc.dim('All missions complete. Use this text in your swag claim issue.'),
        ].join('\n'),
        pc.green('Campaign Complete')
      )
      console.log(buildCertificateText(summary))
    })
}
