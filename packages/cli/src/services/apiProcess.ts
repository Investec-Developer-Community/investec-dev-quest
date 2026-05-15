import { spawn } from 'child_process'
import { join } from 'path'
import { REPO_ROOT } from '../paths.js'

const MOCK_API_PORT = parseInt(process.env['GAME_API_PORT'] ?? '3001', 10)
const HEALTH_URL = `http://127.0.0.1:${MOCK_API_PORT}/health`

export async function isApiRunning(): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1000)

  try {
    const res = await fetch(HEALTH_URL, { signal: controller.signal })
    if (!res.ok) return false
    const body = await res.json().catch(() => null) as { service?: string } | null
    return body?.service === 'investec-mock-api'
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export async function ensureApiRunning(): Promise<void> {
  if (await isApiRunning()) return

  const launchAttempts = buildLaunchAttempts()
  const launchFailures: string[] = []

  for (const attempt of launchAttempts) {
    let spawnError: Error | null = null
    let earlyExitCode: number | null = null

    const child = spawn(attempt.command, attempt.args, {
      detached: false,
      stdio: 'ignore',
      shell: process.platform === 'win32',
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        GAME_API_PORT: String(MOCK_API_PORT),
      },
    })

    child.once('error', (err) => {
      spawnError = err
    })

    child.once('exit', (code) => {
      earlyExitCode = code
    })

    child.unref()

    // Wait up to 5s for this attempt to become available
    for (let i = 0; i < 25; i++) {
      if (await isApiRunning()) return

      if (spawnError !== null) {
        launchFailures.push(
          `${attempt.label}: failed to launch (${String(spawnError)})`
        )
        break
      }

      if (earlyExitCode !== null) {
        launchFailures.push(
          `${attempt.label}: exited before healthy (exit code ${earlyExitCode})`
        )
        break
      }

      await sleep(200)
    }

    if (await isApiRunning()) return
  }

  const windowsHint =
    process.platform === 'win32'
      ? `\nWindows note: if PowerShell blocks scripts, run: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
      : ''

  const failureDetails =
    launchFailures.length > 0
      ? `\nLaunch attempts:\n- ${launchFailures.join('\n- ')}`
      : ''

  throw new Error(
    `Mock API did not start on port ${MOCK_API_PORT} within 5 seconds.\n` +
      `Health check failed: ${HEALTH_URL}\n` +
      `Try running it manually: pnpm --filter @investec-game/mock-api start` +
      failureDetails +
      windowsHint
  )
}

function buildLaunchAttempts(): Array<{ label: string; command: string; args: string[] }> {
  const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  const tsxBinary =
    process.platform === 'win32'
      ? join(REPO_ROOT, 'packages', 'mock-api', 'node_modules', '.bin', 'tsx.cmd')
      : join(REPO_ROOT, 'packages', 'mock-api', 'node_modules', '.bin', 'tsx')
  const mockApiEntry = join(REPO_ROOT, 'packages', 'mock-api', 'src', 'index.ts')

  return [
    {
      label: 'pnpm filtered start',
      command: pnpmCommand,
      args: ['--filter', '@investec-game/mock-api', 'start'],
    },
    {
      label: 'package-local tsx',
      command: tsxBinary,
      args: [mockApiEntry],
    },
  ]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
