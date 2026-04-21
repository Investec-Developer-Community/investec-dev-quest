/**
 * Preflight checks — run before any command that needs the environment.
 * Exits with a clear actionable message on any failure.
 */
import { existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const MIN_NODE_MAJOR = 20
const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url))

export function checkNodeVersion(): void {
  const [major] = process.versions.node.split('.').map(Number)
  if ((major ?? 0) < MIN_NODE_MAJOR) {
    console.error(
      chalk.red(
        `Node.js ${MIN_NODE_MAJOR}+ is required. You are running ${process.versions.node}.\n` +
          `  Install via: https://nodejs.org or use a version manager like fnm/nvm.`
      )
    )
    process.exit(1)
  }
}

export function checkEnvFile(): void {
  const envPath = join(REPO_ROOT, '.env')
  const examplePath = join(REPO_ROOT, '.env.example')

  if (!existsSync(envPath)) {
    if (existsSync(examplePath)) {
      console.error(
        chalk.yellow(
          `.env file not found.\n` +
            `  Run: ${chalk.cyan('cp .env.example .env')} in the repo root, then retry.`
        )
      )
    } else {
      console.error(chalk.yellow(`.env file not found. See README.md for setup instructions.`))
    }
    process.exit(1)
  }
}

export function checkRequiredEnvVars(): void {
  const required = ['GAME_API_BASE_URL', 'GAME_API_CLIENT_ID', 'GAME_API_CLIENT_SECRET', 'GAME_API_KEY']
  const missing = required.filter((k) => !process.env[k])

  if (missing.length > 0) {
    console.error(
      chalk.red(
        `Missing required environment variables:\n` +
          missing.map((k) => `  ${chalk.bold(k)}`).join('\n') +
          `\n\n  Check your .env file (see .env.example for reference).`
      )
    )
    process.exit(1)
  }
}

export function runPreflightChecks(): void {
  checkNodeVersion()
  checkEnvFile()
  checkRequiredEnvVars()
}
