import type { Command } from 'commander'
import { existsSync } from 'fs'
import { p, pc } from '../ui/theme.js'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel, loadAllLevels } from '../levels/loader.js'
import { runTests, runAttack } from '../runner/testRunner.js'
import {
  renderTestResults,
  renderAttackResult,
  renderWinBanner,
  renderBeginnerGuidance,
} from '../runner/feedback.js'
import { getArcFlagEvidence, getProgress, upsertProgress, incrementAttempts } from '../db/progress.js'
import { ensureApiRunning } from '../services/apiProcess.js'
import { applyFlagWritesFromResults } from '../services/arcFlags.js'
import type { ResolvedLevel } from '../levels/loader.js'
import { resolveLevelSelection } from './levelSelection.js'

interface RunLevelEvaluationOptions {
  countAttempt?: boolean
  showWinBanner?: boolean
  nextLevelCommand?: string
  verbose?: boolean
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
  const verbose = options.verbose ?? false

  // Run behaviour tests
  const testSpinner = p.spinner()
  testSpinner.start('Running behavior tests…')
  const testResults = await runTests(testsDir, manifest.id)
  testSpinner.stop('Behavior tests complete')
  renderTestResults(testResults, 'Behavior Tests', { verbose })

  // Run attack script
  const attackSpinner = p.spinner()
  attackSpinner.start('Running attack script…')
  const attackResults = await runAttack(attackDir, manifest.id)
  attackSpinner.stop('Attack script complete')

  // The attack script is written so that it PASSES when the exploit is blocked.
  // If attack tests all pass -> exploit is blocked -> good.
  const exploitBlocked = attackResults.passed && !attackResults.error
  renderAttackResult(attackResults, exploitBlocked, { verbose })

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

  // Deterministic consequence tracking: write arc flags only from explicit test signals.
  applyFlagWritesFromResults(manifest.id, testResults, attackResults, levelComplete)

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
    .option('-v, --verbose', 'Show full test failure traces')
    .action(async (opts: { season?: string; level?: string; verbose?: boolean }) => {
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath } = resolved

      if (!existsSync(solutionPath)) {
        p.cancel(pc.red(`No solution.js found. Run: pnpm game level ${level} --season ${season}`))
        p.log.message(pc.dim('Tip: loading a level creates starter code and sets your active level for test/hint/reset/watch.'))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      // Start mock API if this level needs it
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

      p.log.step(pc.bold(`Running: ${manifest.name}`))

      const nextLevelCommand = getNextLevelCommand(manifest.id)
      const evaluationOptions: RunLevelEvaluationOptions = nextLevelCommand
        ? { nextLevelCommand, verbose: opts.verbose === true }
        : { verbose: opts.verbose === true }
      const complete = await runLevelEvaluation(resolved, evaluationOptions)
      if (!complete) {
        const hasArcEvidence = getArcFlagEvidence().length > 0
        renderBeginnerGuidance({ includeJournal: hasArcEvidence })
        process.exitCode = EXIT_CODES.EXPECTED_TEST_FAILURE
      } else {
        p.outro(pc.green('Done!'))
      }
    })
}
