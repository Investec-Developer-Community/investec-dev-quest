import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const command = args[0]
const tsxBin = resolve('packages/cli/node_modules/.bin/tsx')
const cliEntrypoint = resolve('packages/cli/src/index.ts')

function runPnpm(pnpmArgs) {
  return spawnSync('pnpm', pnpmArgs, {
    stdio: 'inherit',
    shell: false,
  })
}

const build = runPnpm(['--filter', '@investec-game/shared', 'build'])
if ((build.status ?? 1) !== 0) {
  process.exit(build.status ?? 1)
}

const cli = existsSync(tsxBin)
  ? spawnSync(tsxBin, [cliEntrypoint, ...args], {
      stdio: 'inherit',
      shell: false,
    })
  : runPnpm(['--filter', '@investec-game/cli', 'run', 'dev', ...args])
const exitCode = cli.status ?? 1

// Gameplay test failures are expected while learning. Keep output clean and avoid
// pnpm lifecycle noise, but preserve hard failures for broken commands/runtime issues.
if (command === 'test' && exitCode === 1) {
  process.exit(0)
}

process.exit(exitCode)
