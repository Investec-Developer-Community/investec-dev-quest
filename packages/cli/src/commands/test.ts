import type { Command } from 'commander'
import { existsSync, readdirSync } from 'fs'
import { p, pc } from '../ui/theme.js'
import { EXIT_CODES, type TestRunResult } from '@investec-game/shared'
import { findLevelDir, loadLevel, loadAllLevels } from '../levels/loader.js'
import { runTests, runAttack } from '../runner/testRunner.js'
import {
  renderTestResults,
  renderAttackResult,
  renderWinBanner,
  renderBeginnerGuidance,
  renderMilestones,
  renderProgressDelta,
  renderSocialPrompt,
  renderStuckLadder,
} from '../runner/feedback.js'
import {
  getAllProgress,
  getArcFlagEvidence,
  getArcFlags,
  getCaseFile,
  getLastRun,
  getProgress,
  getShownSocialPrompts,
  getUnlockedHints,
  incrementAttempts,
  markSocialPromptsShown,
  recordActivity,
  setLastRun,
  upsertCaseFile,
  upsertProgress,
} from '../db/progress.js'
import { ensureApiRunning } from '../services/apiProcess.js'
import { applyFlagWritesFromResults } from '../services/arcFlags.js'
import type { ResolvedLevel } from '../levels/loader.js'
import { resolveLevelSelection } from './levelSelection.js'
import { deriveCaseFileEntry } from '../services/caseFiles.js'
import { levelCommand, resolveNextMission } from '../services/paths.js'
import { detectMilestones } from '../services/milestones.js'
import { collectSocialMoments, socialPromptsDisabled } from '../services/social.js'

export const STUCK_LADDER_ATTEMPT_THRESHOLD = 5

function passedCount(results: TestRunResult): number {
  return results.tests.filter((test) => test.status === 'pass').length
}

interface RunLevelEvaluationOptions {
  countAttempt?: boolean
  showWinBanner?: boolean
  verbose?: boolean
  quietSocial?: boolean
}

export async function runLevelEvaluation(
  level: ResolvedLevel,
  options: RunLevelEvaluationOptions = {}
): Promise<boolean> {
  const { manifest, testsDir, attackDir } = level
  const countAttempt = options.countAttempt ?? true
  const showBanner = options.showWinBanner ?? true
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
  renderAttackResult(attackResults, exploitBlocked, {
    verbose,
    ...(manifest.attackName ? { attackName: manifest.attackName } : {}),
  })

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

  recordActivity()

  const currentRun = {
    behaviorPassed: passedCount(testResults),
    behaviorTotal: testResults.total,
    attackPassed: passedCount(attackResults),
    attackTotal: attackResults.total,
    at: new Date().toISOString(),
  }
  const previousRun = getLastRun(manifest.id)
  setLastRun(manifest.id, currentRun)
  if (!levelComplete && previousRun && !testResults.error && !attackResults.error) {
    renderProgressDelta(previousRun, currentRun)
  }

  // Deterministic consequence tracking: write arc flags only from explicit test signals.
  applyFlagWritesFromResults(manifest.id, testResults, attackResults, levelComplete)

  if (levelComplete) {
    const progressBefore = getAllProgress()
    const arcFlags = getArcFlags()
    const arcEvidence = getArcFlagEvidence()
    const existingCaseFile = getCaseFile(manifest.id)
    const caseFile = deriveCaseFileEntry(
      manifest,
      arcFlags,
      arcEvidence,
      existingCaseFile?.createdAt
    )

    upsertCaseFile(caseFile)

    upsertProgress({
      ...progress,
      status: 'complete',
      attempts,
      completedAt: progress.completedAt ?? new Date().toISOString(),
    })
    if (showBanner) {
      const levels = loadAllLevels()
      const progressAfter = getAllProgress()
      const next = resolveNextMission(levels, progressAfter)
      renderWinBanner(manifest.name, {
        attempts,
        hintsUsed: progress.hintsUsed,
        referenceCommand: `pnpm game reference --season ${manifest.season} --level ${manifest.level}`,
        boss: manifest.boss === true,
        caseFile,
        nextMission: next
          ? {
              command: levelCommand(next.level),
              name: next.level.manifest.name,
              pathName: next.path.name,
              complete: next.complete,
              total: next.total,
            }
          : null,
      })
      renderMilestones(detectMilestones(levels, progressBefore, progressAfter))

      const moments = collectSocialMoments(levels, progressBefore, progressAfter, manifest)
      if (moments.length > 0) {
        const shown = getShownSocialPrompts()
        const moment = moments.find((entry) => !shown.has(entry.key))
        if (moment && !options.quietSocial && !socialPromptsDisabled()) {
          renderSocialPrompt(moment)
        }
        markSocialPromptsShown(moments.map((entry) => entry.key))
      }
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
    .option('--quiet-social', 'Skip share/star prompts on milestones (or set GAME_QUIET_SOCIAL=1)')
    .action(async (opts: { season?: string; level?: string; verbose?: boolean; quietSocial?: boolean }) => {
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

      const complete = await runLevelEvaluation(resolved, {
        verbose: opts.verbose === true,
        quietSocial: opts.quietSocial === true,
      })
      if (!complete) {
        const attempts = getProgress(manifest.id)?.attempts ?? 0
        if (attempts >= STUCK_LADDER_ATTEMPT_THRESHOLD) {
          const hintsTotal = existsSync(resolved.hintsDir)
            ? readdirSync(resolved.hintsDir).filter((file) => file.endsWith('.md')).length
            : 0
          const unlocked = getUnlockedHints(manifest.id)
          renderStuckLadder({
            manifest,
            hintsUnlocked: Math.min(unlocked.length, hintsTotal),
            hintsTotal,
            walkthroughUnlocked: unlocked.length > hintsTotal,
            intro: `${attempts} attempts on this mission. Here's how to get unstuck:`,
          })
        } else {
          const hasArcEvidence = getArcFlagEvidence().length > 0
          renderBeginnerGuidance({ includeJournal: hasArcEvidence })
        }
        process.exitCode = EXIT_CODES.EXPECTED_TEST_FAILURE
      } else {
        p.outro(pc.green('Done!'))
      }
    })
}
