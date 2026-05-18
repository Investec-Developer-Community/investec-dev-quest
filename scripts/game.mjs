import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

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

function runPnpmQuiet(pnpmArgs) {
  return spawnSync('pnpm', pnpmArgs, {
    stdio: 'pipe',
    shell: false,
    encoding: 'utf8',
  })
}

function newestMtimeMs(path) {
  if (!existsSync(path)) return 0

  const stats = statSync(path)
  if (!stats.isDirectory()) return stats.mtimeMs

  let newest = stats.mtimeMs
  for (const entry of readdirSync(path)) {
    const childPath = resolve(path, entry)
    const childNewest = newestMtimeMs(childPath)
    if (childNewest > newest) newest = childNewest
  }
  return newest
}

function sharedBuildRequired() {
  const sharedSrc = resolve('packages/shared/src')
  const sharedDist = resolve('packages/shared/dist')
  const sharedPkg = resolve('packages/shared/package.json')
  const sharedTsconfig = resolve('packages/shared/tsconfig.json')
  const distIndex = resolve('packages/shared/dist/index.js')

  if (!existsSync(distIndex)) return true

  const sourceNewest = Math.max(
    newestMtimeMs(sharedSrc),
    newestMtimeMs(sharedPkg),
    newestMtimeMs(sharedTsconfig)
  )
  const distNewest = newestMtimeMs(sharedDist)

  return sourceNewest > distNewest
}

function ensureSharedBuild() {
  if (!sharedBuildRequired()) return 0

  const build = runPnpmQuiet(['--filter', '@investec-game/shared', 'build'])
  if ((build.status ?? 1) !== 0) {
    if (build.stdout) process.stdout.write(build.stdout)
    if (build.stderr) process.stderr.write(build.stderr)
    return build.status ?? 1
  }

  return 0
}

const buildCode = ensureSharedBuild()
if (buildCode !== 0) {
  process.exit(buildCode)
}

const sharedDistModuleUrl = pathToFileURL(resolve('packages/shared/dist/index.js')).href
const { EXIT_CODES } = await import(sharedDistModuleUrl)

const cli = existsSync(tsxBin)
  ? spawnSync(tsxBin, [cliEntrypoint, ...args], {
      stdio: 'inherit',
      shell: false,
    })
  : runPnpm(['--filter', '@investec-game/cli', 'run', 'dev', ...args])
const exitCode = cli.status ?? 1

// Gameplay test failures are expected while learning. Keep output clean and avoid
// pnpm lifecycle noise, but preserve hard failures for broken commands/runtime issues.
if (command === 'test' && exitCode === EXIT_CODES.EXPECTED_TEST_FAILURE) {
  process.exit(0)
}

process.exit(exitCode)
