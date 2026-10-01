import type { Command } from 'commander'
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import open from 'open'
import { EXIT_CODES } from '@investec-game/shared'
import { getAllProgress } from '../db/progress.js'
import { loadAllLevels } from '../levels/loader.js'
import { buildClaimBundle, buildClaimIssueUrl } from '../services/claim.js'
import { p, pc } from '../ui/theme.js'

export function registerClaimCommand(program: Command): void {
  program
    .command('claim')
    .description('Save a completion claim bundle and open the pre-filled swag issue')
    .option('--no-open', 'Print the issue URL without opening a browser')
    .action(async (options: { open: boolean }) => {
      try {
        const bundle = buildClaimBundle(loadAllLevels(), getAllProgress())
        const claimDir = join(homedir(), '.investec-game', 'claims')
        mkdirSync(claimDir, { recursive: true })
        const claimPath = join(claimDir, `${bundle.contentHash}.json`)
        writeFileSync(claimPath, JSON.stringify(bundle, null, 2) + '\n', 'utf8')
        const url = buildClaimIssueUrl(bundle)

        p.note([
          pc.green(`${bundle.totalLevels}/${bundle.totalLevels} missions complete`),
          `XP: ${bundle.totalXp}/${bundle.maxXp}`,
          '',
          `Bundle: ${claimPath}`,
          `SHA-256: ${bundle.contentHash}`,
          '',
          'The hash checks bundle integrity, not independent solving.',
          'Review the issue, enter your GitHub handle, and confirm your own completion.',
          'Enter your honest total play time (HH:MM:SS) in the issue, excluding breaks and time away.',
        ].join('\n'), 'Swag Claim Ready')

        if (!options.open) {
          console.log(url)
          return
        }
        try {
          await open(url)
          p.log.success('Opened the pre-filled swag claim. Review and submit it in your browser.')
        } catch {
          p.log.warn('Could not open a browser. Open this pre-filled issue URL manually:')
          console.log(url)
        }
      } catch (error) {
        p.cancel(error instanceof Error ? error.message : String(error))
        process.exitCode = EXIT_CODES.USAGE_ERROR
      }
    })
}
