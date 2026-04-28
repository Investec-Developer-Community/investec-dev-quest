import { spawn } from 'child_process'
import { join } from 'path'
import { fileURLToPath } from 'url'

const MOCK_API_PORT = parseInt(process.env['GAME_API_PORT'] ?? '3001', 10)
const REPO_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))
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

  const child = spawn('npx', ['tsx', mockApiEntry], {
    detached: false,
    stdio: 'ignore',
    env: {
      ...process.env,
      GAME_API_PORT: String(MOCK_API_PORT),
    },
  })

  child.unref()

  // Wait up to 5s for the API to become available
  for (let i = 0; i < 25; i++) {
    await sleep(200)
    if (await isApiRunning()) return
  }

  throw new Error(
    `Mock API did not start on port ${MOCK_API_PORT} within 5 seconds.\n` +
      `Health check failed: ${HEALTH_URL}\n` +
      `Try running it manually: npx tsx packages/mock-api/src/index.ts`
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
