import type { Command } from 'commander'
import { existsSync } from 'fs'
import { p, pc, showBanner } from '../ui/theme.js'
import { EXIT_CODES, type TestResult } from '@investec-game/shared'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { runTests, runAttack } from '../runner/testRunner.js'
import { ensureApiRunning } from '../services/apiProcess.js'
import { resolveLevelSelection } from './levelSelection.js'
import { summarizeFailureMessage } from '../runner/failureSummary.js'

function nextStepFor(testName: string, failureSummary: string, isAttack: boolean): string {
  const text = `${testName} ${failureSummary}`.toLowerCase()

  if (/(hardcoded|hard-coded|hard code|literal credentials?|client[ _-]?id|client[ _-]?secret)/.test(text)) {
    return 'Remove literal credentials and build Basic auth from the function arguments.'
  }
  if (/(auth|token|credential|oauth)/.test(text)) {
    return 'Trace which credentials are used in this path and verify non-2xx auth responses are handled explicitly.'
  }
  if (/(cursor|pagination|page)/.test(text)) {
    return 'Inspect pagination flow: append each page, update cursor correctly, and stop only when nextCursor is null.'
  }
  if (/(beneficiar|payee)/.test(text)) {
    return 'Validate beneficiary identity before proceeding and separate existence checks from approval decisions.'
  }
  if (/(idempot|retry key)/.test(text)) {
    return 'Check how idempotency keys are derived and ensure retried-equivalent requests produce the same key.'
  }
  if (/(daily_spend|declined|state|mutate|approve-then-write)/.test(text)) {
    return 'Review write timing: only persist state after approval outcomes, not during declined or pre-check paths.'
  }
  if (/(mcc|merchant|category|string|number|coerc)/.test(text)) {
    return 'Normalize boundary input types before policy checks so allow/deny logic compares like-for-like values.'
  }
  if (/(tool|allowlist|trusted|registry|prefix)/.test(text)) {
    return 'Re-check tool resolution/authorization rules for exact matching and trust requirements before execution.'
  }
  if (/(prompt|description|inject|redact|sanitize)/.test(text)) {
    return 'Treat external text as untrusted input and verify sanitization/redaction occurs before downstream use.'
  }
  if (/(loop|consecutive|repeat)/.test(text)) {
    return 'Inspect loop detection criteria: consecutive-call tracking should be robust even when parameters change.'
  }
  if (/(citation|claim|source)/.test(text)) {
    return 'Confirm every claim undergoes source validation rather than assuming one validated item covers all claims.'
  }
  if (isAttack) {
    return 'Replay the exploit input from the failing attack test and add a narrow guard that blocks this path without breaking valid behavior.'
  }

  return 'Start at the failing assertion, reproduce that path with minimal input, and verify each branch condition before the final return.'
}

function renderCoachingSection(title: string, failures: TestResult[], isAttack: boolean): void {
  if (failures.length === 0) {
    p.note(pc.green('No failing tests in this section.'), pc.green(title))
    return
  }

  const lines: string[] = [
    pc.yellow('Coaching guidance based on current failures:'),
    '',
  ]

  for (const failed of failures.slice(0, 8)) {
    const summary = failed.message ? summarizeFailureMessage(failed.message) : 'Assertion failed'
    lines.push(`- Failing test: ${failed.name}`)
    lines.push(`  Why it failed: ${summary}`)
    lines.push(`  Next step: ${nextStepFor(failed.name, summary, isAttack)}`)
  }

  if (failures.length > 8) {
    lines.push('')
    lines.push(pc.dim(`Showing 8/${failures.length} failures. Resolve a few, then re-run explain for tighter guidance.`))
  }

  lines.push('')
  lines.push(pc.dim('This command is intentionally non-spoiler: it guides your debugging path without giving final code.'))

  p.note(lines.join('\n'), pc.yellow(title))
}

export function registerExplainCommand(program: Command): void {
  program
    .command('explain')
    .description('Turn current failing tests into next-step coaching (without solution spoilers)')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .action(async (opts: { season?: string; level?: string }) => {
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath, testsDir, attackDir } = resolved

      if (!existsSync(solutionPath)) {
        p.cancel(pc.red(`No solution.js found. Run: pnpm game level ${level} --season ${season}`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      if (manifest.apiRequired) {
        const apiSpinner = p.spinner()
        apiSpinner.start('Starting mock Investec API…')
        try {
          await ensureApiRunning()
          apiSpinner.stop('Mock Investec API is running')
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to start mock API'
          apiSpinner.stop(pc.red(msg))
          p.cancel(pc.red(msg))
          process.exit(EXIT_CODES.USAGE_ERROR)
        }
      }

      showBanner()
      p.log.step(pc.bold(`Explain mode: ${manifest.name}`))

      const behaviorSpinner = p.spinner()
      behaviorSpinner.start('Analyzing behavior test failures…')
      const behavior = await runTests(testsDir, manifest.id)
      behaviorSpinner.stop('Behavior analysis complete')

      const attackSpinner = p.spinner()
      attackSpinner.start('Analyzing attack test failures…')
      const attack = await runAttack(attackDir, manifest.id)
      attackSpinner.stop('Attack analysis complete')

      if (behavior.error) {
        p.note(pc.red(`Runner error:\n${behavior.error}`), pc.red('Behavior Tests'))
      } else {
        const failures = behavior.tests.filter((t) => t.status === 'fail')
        renderCoachingSection('Behavior Coaching', failures, false)
      }

      if (attack.error) {
        p.note(pc.red(`Runner error:\n${attack.error}`), pc.red('Attack Script'))
      } else {
        const failures = attack.tests.filter((t) => t.status === 'fail')
        renderCoachingSection('Attack Coaching', failures, true)
      }

      const allPassing = behavior.passed && attack.passed && !behavior.error && !attack.error
      if (allPassing) {
        p.outro(pc.green('No failures to explain — both behavior and attack tests are passing.'))
      } else {
        p.outro(pc.cyan('Explain complete. Make one targeted change, then re-run pnpm game test.'))
      }
    })
}