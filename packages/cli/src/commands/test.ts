import type { Command } from 'commander'
import { existsSync } from 'fs'
import chalk from 'chalk'
import ora from 'ora'
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
  return `investec-game level ${next.level} --season ${next.season}`
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

  const levelComplete = testResults.passed && exploitBlocked
  if (levelComplete) {
    upsertProgress({
      ...progress,
      status: 'complete',
      completedAt: progress.completedAt ?? new Date().toISOString(),
    })
    if (showBanner) {
      renderWinBanner(manifest.name, nextLevelCommand)
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
      const { season, level } = resolveLevelSelection(opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        console.error(chalk.red(`Level S${season}L${level} not found.`))
        process.exit(1)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath } = resolved

      if (!existsSync(solutionPath)) {
        console.error(
          chalk.red(
            `No solution.js found. Run: investec-game level ${level} --season ${season}`
          )
        )
        console.log(
          chalk.dim(
            'Tip: loading a level creates starter code and sets your active level for test/hint/reset/watch.'
          )
        )
        process.exit(1)
      }

      // Start mock API if this level needs it
      if (manifest.apiRequired) {
        const apiSpinner = ora('Starting mock Investec API…').start()
        try {
          await ensureApiRunning()
          apiSpinner.succeed('Mock Investec API is running')
        } catch (err) {
          apiSpinner.fail(
            err instanceof Error ? err.message : 'Failed to start mock API'
          )
          process.exit(1)
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
        process.exitCode = 1
      }
    })
}
