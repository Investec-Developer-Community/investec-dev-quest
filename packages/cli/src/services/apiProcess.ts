import { Socket } from 'net'
import { spawn } from 'child_process'
import { join } from 'path'
import { fileURLToPath } from 'url'

const MOCK_API_PORT = parseInt(process.env['GAME_API_PORT'] ?? '3001', 10)
const REPO_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))

export async function isApiRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const client = new Socket()
    client.once('connect', () => {
      client.destroy()
      resolve(true)
    })
    client.once('error', () => resolve(false))
    client.connect(MOCK_API_PORT, '127.0.0.1')
  })
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
      `Try running it manually: npx tsx packages/mock-api/src/index.ts`
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
