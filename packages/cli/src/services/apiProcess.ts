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

  const mockApiEntry = join(REPO_ROOT, 'packages', 'mock-api', 'src', 'index.ts')
  const useShell = process.platform === 'win32'
  let spawnError: Error | null = null
  let earlyExitCode: number | null = null

  const child = spawn('npx', ['tsx', mockApiEntry], {
    detached: false,
    stdio: 'ignore',
    shell: useShell,
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

  // Wait up to 5s for the API to become available
  for (let i = 0; i < 25; i++) {
    const launchErr = spawnError
    if (launchErr !== null) {
      throw new Error(
        `Mock API failed to launch: ${String(launchErr)}\n` +
          `Try running it manually: npx tsx packages/mock-api/src/index.ts`
      )
    }

    if (earlyExitCode !== null) {
      throw new Error(
        `Mock API exited before becoming healthy (exit code ${earlyExitCode}).\n` +
          `Try running it manually: npx tsx packages/mock-api/src/index.ts`
      )
    }

    await sleep(200)
    if (await isApiRunning()) return
  }

  const windowsHint =
    process.platform === 'win32'
      ? `\nWindows note: if PowerShell blocks scripts, run: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
      : ''

  throw new Error(
    `Mock API did not start on port ${MOCK_API_PORT} within 5 seconds.\n` +
      `Health check failed: ${HEALTH_URL}\n` +
      `Try running it manually: npx tsx packages/mock-api/src/index.ts` +
      windowsHint
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
