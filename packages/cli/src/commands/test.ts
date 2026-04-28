import type { Command } from 'commander'
import { existsSync } from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel, loadAllLevels } from '../levels/loader.js'
import { runTests, runAttack } from '../runner/testRunner.js'
import {
  renderTestResults,
  renderAttackResult,
  renderWinBanner,
  renderBeginnerGuidance,
} from '../runner/feedback.js'
import { getProgress, upsertProgress, incrementAttempts } from '../db/progress.js'
import { ensureApiRunning } from '../services/apiProcess.js'
import type { ResolvedLevel } from '../levels/loader.js'
import { resolveLevelSelection } from './levelSelection.js'

interface RunLevelEvaluationOptions {
  countAttempt?: boolean
  showWinBanner?: boolean
  nextLevelCommand?: string
}

function getNextLevelCommand(currentLevelId: string): string | undefined {
  const sortedLevels = loadAllLevels().sort((a, b) => {
    if (a.manifest.season !== b.manifest.season) {
      return a.manifest.season - b.manifest.season
    }
    return a.manifest.level - b.manifest.level
  })

  const currentIndex = sortedLevels.findIndex((entry) => entry.manifest.id === currentLevelId)
  if (currentIndex < 0 || currentIndex >= sortedLevels.length - 1) {
    return undefined
  }

  const next = sortedLevels[currentIndex + 1]?.manifest
  if (!next) return undefined
  return `pnpm game level ${next.level} --season ${next.season}`
}

export async function runLevelEvaluation(
  level: ResolvedLevel,
  options: RunLevelEvaluationOptions = {}
): Promise<boolean> {
  const { manifest, testsDir, attackDir } = level
  const countAttempt = options.countAttempt ?? true
  const showBanner = options.showWinBanner ?? true
  const nextLevelCommand = options.nextLevelCommand

  // Run behaviour tests
  const testSpinner = ora('Running behavior tests…').start()
  const testResults = await runTests(testsDir, manifest.id)
  testSpinner.stop()
  renderTestResults(testResults, 'Behavior Tests')

  // Run attack script
  const attackSpinner = ora('Running attack script…').start()
  const attackResults = await runAttack(attackDir, manifest.id)
  attackSpinner.stop()

  // The attack script is written so that it PASSES when the exploit is blocked.
  // If attack tests all pass -> exploit is blocked -> good.
  const exploitBlocked = attackResults.passed && !attackResults.error
  renderAttackResult(attackResults, exploitBlocked)

  // Update progress
  const progress = getProgress(manifest.id) ?? {
    levelId: manifest.id,
    status: 'active' as const,
    attempts: 0,
    hintsUsed: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
  }

  if (countAttempt) {
    incrementAttempts(manifest.id)
  }

  const attempts = progress.attempts + (countAttempt ? 1 : 0)

  const levelComplete = testResults.passed && exploitBlocked
  if (levelComplete) {
    upsertProgress({
      ...progress,
      status: 'complete',
      attempts,
      completedAt: progress.completedAt ?? new Date().toISOString(),
    })
    if (showBanner) {
      renderWinBanner(manifest.name, {
        attempts,
        hintsUsed: progress.hintsUsed,
        referenceCommand: `pnpm game reference --season ${manifest.season} --level ${manifest.level}`,
        ...(nextLevelCommand ? { nextLevelCommand } : {}),
      })
    }
  }

  return levelComplete
}

export function registerTestCommand(program: Command): void {
  program
    .command('test')
    .description('Run tests and attack script for the active level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .action(async (opts: { season?: string; level?: string }) => {
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        program.error(chalk.red(`Level S${season}L${level} not found.`), {
          exitCode: EXIT_CODES.USAGE_ERROR,
          code: 'game.test.not-found',
        })
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath } = resolved

      if (!existsSync(solutionPath)) {
        program.error(
          `${chalk.red(`No solution.js found. Run: pnpm game level ${level} --season ${season}`)}\n${chalk.dim(
            'Tip: loading a level creates starter code and sets your active level for test/hint/reset/watch.'
          )}`,
          { exitCode: EXIT_CODES.USAGE_ERROR, code: 'game.test.no-solution' }
        )
      }

      // Start mock API if this level needs it
      if (manifest.apiRequired) {
        const apiSpinner = ora('Starting mock Investec API…').start()
        try {
          await ensureApiRunning()
          apiSpinner.succeed('Mock Investec API is running')
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to start mock API'
          apiSpinner.fail(msg)
          program.error(chalk.red(msg), {
            exitCode: EXIT_CODES.USAGE_ERROR,
            code: 'game.test.api-start-failed',
          })
        }
      }

      console.log(chalk.bold(`\nRunning: ${manifest.name}\n`))

      const nextLevelCommand = getNextLevelCommand(manifest.id)
      const evaluationOptions: RunLevelEvaluationOptions = nextLevelCommand
        ? { nextLevelCommand }
        : {}
      const complete = await runLevelEvaluation(resolved, evaluationOptions)
      if (!complete) {
        renderBeginnerGuidance()
        process.exitCode = EXIT_CODES.EXPECTED_TEST_FAILURE
      }
    })
}
