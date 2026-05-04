import type { Command } from 'commander'
import { existsSync } from 'fs'
import { relative } from 'path'
import { p, pc } from '../ui/theme.js'
import chokidar from 'chokidar'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { ensureApiRunning } from '../services/apiProcess.js'
import { runLevelEvaluation } from './test.js'
import { resolveLevelSelection } from './levelSelection.js'

export function registerWatchCommand(program: Command): void {
  program
    .command('watch')
    .description('Watch level files and re-run tests + attack script on save')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('-d, --debounce <ms>', 'Debounce delay in ms', '300')
    .action(async (opts: { season?: string; level?: string; debounce: string }) => {
      const { season, level } = resolveLevelSelection(program, opts)
      const parsedDebounce = parseInt(opts.debounce, 10)
      const debounceMs = Number.isFinite(parsedDebounce)
        ? Math.max(parsedDebounce, 0)
        : 300

      if (!Number.isFinite(parsedDebounce) || parsedDebounce < 0) {
        p.cancel(pc.red(`Invalid debounce value: ${opts.debounce}`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, solutionPath, testsDir, attackDir, dir } = resolved

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

      p.log.step(pc.bold(`Watching: ${manifest.name}`))
      p.log.message(pc.dim(`Files: solution.js, tests/, attack/`))
      p.log.message(pc.dim(`Debounce: ${debounceMs}ms`))
      p.log.message(pc.dim('Press Ctrl+C to stop.'))

      let inFlight = false
      let rerunQueued = false
      let pendingReason = 'initial run'
      let debounceTimer: NodeJS.Timeout | null = null

      const runCycle = async (reason: string): Promise<void> => {
        if (inFlight) {
          rerunQueued = true
          pendingReason = reason
          return
        }

        inFlight = true
        p.log.info(pc.cyan(`[${new Date().toLocaleTimeString()}] Re-running (${reason})`))

        try {
          await runLevelEvaluation(resolved, {
            countAttempt: false,
            showWinBanner: true,
          })
        } finally {
          inFlight = false
          if (rerunQueued) {
            rerunQueued = false
            await runCycle(pendingReason)
          }
        }
      }

      const schedule = (reason: string): void => {
        pendingReason = reason
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          void runCycle(reason)
        }, debounceMs)
      }

      const eventPathLabel = (path: string): string => {
        const rel = relative(dir, path)
        return rel.length > 0 ? rel : path
      }

      const watcher = chokidar.watch([solutionPath, testsDir, attackDir], {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 200,
          pollInterval: 100,
        },
      })

      watcher.on('change', (path) => schedule(`changed ${eventPathLabel(path)}`))
      watcher.on('add', (path) => schedule(`added ${eventPathLabel(path)}`))
      watcher.on('unlink', (path) => schedule(`removed ${eventPathLabel(path)}`))
      watcher.on('error', (error) => {
        const msg = error instanceof Error ? error.message : String(error)
        p.log.error(pc.red(`Watcher error: ${msg}`))
      })

      await runCycle('initial run')

      await new Promise<void>((resolve) => {
        let closing = false

        const close = async () => {
          if (closing) return
          closing = true
          if (debounceTimer) clearTimeout(debounceTimer)
          await watcher.close()
          p.log.message(pc.dim('Stopped watch mode.'))
          resolve()
        }

        process.once('SIGINT', () => {
          void close()
        })
        process.once('SIGTERM', () => {
          void close()
        })
      })
    })
}
