/**
 * Preflight checks — run before any command that needs the environment.
 * Exits with a clear actionable message on any failure.
 */
import { existsSync } from 'fs'
import { join } from 'path'
import { EXIT_CODES } from '@investec-game/shared'
import { REPO_ROOT } from './paths.js'
import { p, pc } from './ui/theme.js'

const MIN_NODE_MAJOR = 20

export function checkNodeVersion(): void {
  const [major] = process.versions.node.split('.').map(Number)
  if ((major ?? 0) < MIN_NODE_MAJOR) {
    p.cancel(
      pc.red(
        `Node.js ${MIN_NODE_MAJOR}+ is required. You are running ${process.versions.node}.\n` +
          `  Install via: https://nodejs.org or use a version manager like fnm/nvm.`
      )
    )
    process.exit(EXIT_CODES.USAGE_ERROR)
  }
}

export function checkEnvFile(): void {
  const envPath = join(REPO_ROOT, '.env')
  const examplePath = join(REPO_ROOT, '.env.example')

  if (!existsSync(envPath)) {
    if (existsSync(examplePath)) {
      p.cancel(
        pc.yellow(
          `.env file not found.\n` +
            `  Run: ${pc.cyan('cp .env.example .env')} in the repo root, then retry.`
        )
      )
    } else {
      p.cancel(pc.yellow(`.env file not found. See README.md for setup instructions.`))
    }
    process.exit(EXIT_CODES.USAGE_ERROR)
  }
}

export function checkRequiredEnvVars(): void {
  const required = ['GAME_API_BASE_URL', 'GAME_API_CLIENT_ID', 'GAME_API_CLIENT_SECRET', 'GAME_API_KEY']
  const missing = required.filter((k) => !process.env[k])

  if (missing.length > 0) {
    p.cancel(
      pc.red(
        `Missing required environment variables:\n` +
          missing.map((k) => `  ${pc.bold(k)}`).join('\n') +
          `\n\n  Check your .env file (see .env.example for reference).`
      )
    )
    process.exit(EXIT_CODES.USAGE_ERROR)
  }
}

export function runPreflightChecks(): void {
  checkNodeVersion()
  checkEnvFile()
  checkRequiredEnvVars()
}
