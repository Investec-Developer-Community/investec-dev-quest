import chalk from 'chalk'
import boxen from 'boxen'
import type { TestRunResult } from '@investec-game/shared'

export function renderTestResults(results: TestRunResult, label = 'Tests'): void {
  const lines: string[] = []

  if (results.error) {
    console.log(
      boxen(chalk.red(`Runner error:\n${results.error}`), {
        title: `${label} — Error`,
        titleAlignment: 'left',
        padding: 1,
        borderColor: 'red',
      })
    )
    return
  }

  for (const test of results.tests) {
    if (test.status === 'pass') {
      lines.push(`  ${chalk.green('✓')} ${chalk.dim(test.name)}`)
    } else if (test.status === 'skip') {
      lines.push(`  ${chalk.yellow('⊘')} ${chalk.dim(test.name)} (skipped)`)
    } else {
      lines.push(`  ${chalk.red('✗')} ${chalk.white(test.name)}`)
      if (test.message) {
        const trimmed = test.message.split('\n').slice(0, 6).join('\n')
        lines.push(chalk.red(`    ${trimmed.replace(/\n/g, '\n    ')}`))
      }
    }
  }

  const summary = results.passed
    ? chalk.green.bold(`${results.total}/${results.total} passed`)
    : chalk.red.bold(`${results.failed}/${results.total} failed`)

  lines.push('')
  lines.push(summary)

  const borderColor = results.passed ? 'green' : 'red'

  console.log(
    boxen(lines.join('\n'), {
      title: label,
      titleAlignment: 'left',
      padding: 1,
      borderColor,
    })
  )
}

export function renderWinBanner(levelName: string, nextLevelCommand?: string): void {
  const lines = [
    chalk.yellow.bold('  🎉  Level Complete!'),
    '',
    chalk.white(`  "${levelName}" is solved.`),
    '',
    chalk.dim('  Both behavior tests and the attack script pass.'),
    chalk.dim('  Run `investec-game status` to see your progress.'),
  ]

  if (nextLevelCommand) {
    lines.push('')
    lines.push(chalk.cyan(`  Next level: ${nextLevelCommand}`))
  }

  const content = lines.join('\n')

  console.log(
    boxen(content, {
      padding: 1,
      borderColor: 'yellow',
      borderStyle: 'double',
    })
  )
}

export function renderAttackResult(results: TestRunResult, exploitBlocked: boolean): void {
  const label = 'Attack Script'
  const lines: string[] = []

  if (results.error) {
    lines.push(chalk.red(`Runner error:\n${results.error}`))
  } else {
    for (const test of results.tests) {
      if (test.status === 'pass') {
        lines.push(`  ${chalk.green('✓')} ${chalk.dim(test.name)}`)
      } else {
        lines.push(`  ${chalk.red('✗')} ${chalk.white(test.name)}`)
        if (test.message) {
          const trimmed = test.message.split('\n').slice(0, 4).join('\n')
          lines.push(chalk.red(`    ${trimmed.replace(/\n/g, '\n    ')}`))
        }
      }
    }
  }

  lines.push('')

  if (exploitBlocked) {
    lines.push(chalk.green.bold('Exploit blocked ✓'))
  } else {
    lines.push(chalk.red.bold('Exploit succeeds — vulnerability not yet fixed'))
  }

  console.log(
    boxen(lines.join('\n'), {
      title: label,
      titleAlignment: 'left',
      padding: 1,
      borderColor: exploitBlocked ? 'green' : 'red',
    })
  )
}

export function renderBeginnerGuidance(): void {
  const content = [
    chalk.cyan.bold('  What to do next'),
    '',
    chalk.white('  1. Start with the first failing test above.'),
    chalk.white('  2. Use `investec-game hint` for a nudge.'),
    chalk.white('  3. Make one small change, then run `investec-game test` again.'),
    '',
    chalk.dim('  You can run `investec-game status` anytime to track progress.'),
  ].join('\n')

  console.log(
    boxen(content, {
      padding: 1,
      borderColor: 'cyan',
    })
  )
}
