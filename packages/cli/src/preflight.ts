/**
 * Preflight checks — run before any command that needs the environment.
 * Exits with a clear actionable message on any failure.
 */
import { existsSync } from 'fs'
import { spawnSync } from 'child_process'
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

export function checkWindowsPowerShellPolicy(): void {
  if (process.platform !== 'win32') return

  const cmd =
    '[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; ' +
    '$p = Get-ExecutionPolicy; Write-Output $p'

  const result = spawnSync('powershell', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', cmd], {
    encoding: 'utf8',
  })

  if (result.error || (result.status ?? 1) !== 0) {
    p.cancel(
      pc.red(
        `Could not read PowerShell execution policy.\n` +
          `  Ensure PowerShell is available, then run: ${pc.cyan('Get-ExecutionPolicy')}\n` +
          `  See: ${pc.cyan('docs/windows-setup.md')}`
      )
    )
    process.exit(EXIT_CODES.USAGE_ERROR)
  }

  const policy = (result.stdout ?? '').trim()
  const blockedPolicies = new Set(['Restricted', 'AllSigned'])

  if (blockedPolicies.has(policy)) {
    p.cancel(
      pc.red(
        `PowerShell execution policy (${pc.bold(policy)}) can block npm/pnpm scripts on Windows.\n` +
          `  Run (PowerShell as your user): ${pc.cyan('Set-ExecutionPolicy -Scope CurrentUser RemoteSigned')}\n` +
          `  Then re-run your game command.\n` +
          `  See: ${pc.cyan('docs/windows-setup.md')}`
      )
    )
    process.exit(EXIT_CODES.USAGE_ERROR)
  }
}

export function runPreflightChecks(): void {
  checkNodeVersion()
  checkEnvFile()
  checkRequiredEnvVars()
  checkWindowsPowerShellPolicy()
}
