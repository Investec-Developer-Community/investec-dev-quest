import { p, pc } from '../ui/theme.js'
import type { TestRunResult } from '@investec-game/shared'

export function renderTestResults(results: TestRunResult, label = 'Tests'): void {
  if (results.error) {
    p.log.error(pc.red(`${label} — Error`))
    p.note(pc.red(`Runner error:\n${results.error}`), pc.red(label))
    return
  }

  const lines: string[] = []
  for (const test of results.tests) {
    if (test.status === 'pass') {
      lines.push(`${pc.green('✓')} ${pc.dim(test.name)}`)
    } else if (test.status === 'skip') {
      lines.push(`${pc.yellow('⊘')} ${pc.dim(test.name)} (skipped)`)
    } else {
      lines.push(`${pc.red('✗')} ${test.name}`)
      if (test.message) {
        const trimmed = test.message.split('\n').slice(0, 6).join('\n')
        lines.push(pc.red(`  ${trimmed.replace(/\n/g, '\n  ')}`))
      }
    }
  }

  const summary = results.passed
    ? pc.green(pc.bold(`${results.total}/${results.total} passed`))
    : pc.red(pc.bold(`${results.failed}/${results.total} failed`))

  lines.push('')
  lines.push(summary)

  const title = results.passed ? pc.green(label) : pc.red(label)
  p.note(lines.join('\n'), title)
}

interface WinBannerOptions {
  attempts?: number
  hintsUsed?: number
  referenceCommand?: string
  nextLevelCommand?: string
}

export function renderWinBanner(levelName: string, options: WinBannerOptions = {}): void {
  const attempts = options.attempts ?? 0
  const hintsUsed = options.hintsUsed ?? 0
  const lines = [
    pc.yellow(pc.bold('🎉  Level Complete!')),
    '',
    `"${levelName}" is solved.`,
    '',
    pc.dim('Both behavior tests and the attack script pass.'),
    pc.dim(`Attempts: ${attempts}  Hints used: ${hintsUsed}`),
    pc.dim('Run `pnpm game status` to see your progress.'),
  ]

  if (options.referenceCommand) {
    lines.push(pc.cyan(`Review reference: ${options.referenceCommand}`))
  }

  if (options.nextLevelCommand) {
    lines.push('')
    lines.push(pc.cyan(`Next level: ${options.nextLevelCommand}`))
  }

  p.note(lines.join('\n'), pc.yellow('Level Complete'))
}

export function renderAttackResult(results: TestRunResult, exploitBlocked: boolean): void {
  const lines: string[] = []

  if (results.error) {
    lines.push(pc.red(`Runner error:\n${results.error}`))
  } else {
    for (const test of results.tests) {
      if (test.status === 'pass') {
        lines.push(`${pc.green('✓')} ${pc.dim(test.name)}`)
      } else {
        lines.push(`${pc.red('✗')} ${test.name}`)
        if (test.message) {
          const trimmed = test.message.split('\n').slice(0, 4).join('\n')
          lines.push(pc.red(`  ${trimmed.replace(/\n/g, '\n  ')}`))
        }
      }
    }
  }

  lines.push('')

  if (exploitBlocked) {
    lines.push(pc.green(pc.bold('Exploit blocked ✓')))
  } else {
    lines.push(pc.red(pc.bold('Exploit succeeds — vulnerability not yet fixed')))
  }

  const title = exploitBlocked ? pc.green('Attack Script') : pc.red('Attack Script')
  p.note(lines.join('\n'), title)
}

export function renderBeginnerGuidance(): void {
  const lines = [
    pc.cyan(pc.bold('What to do next')),
    '',
    '1. Start with the first failing test above.',
    '2. Use `pnpm game hint` for a nudge.',
    '3. Make one small change, then run `pnpm game test` again.',
    '',
    pc.dim('Tip: behavior tests protect the feature; the attack script protects the fix.'),
    pc.dim('You can run `pnpm game status` anytime to track progress.'),
  ]

  p.note(lines.join('\n'), pc.cyan('Guidance'))
}
