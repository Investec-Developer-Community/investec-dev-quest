#!/usr/bin/env node
/**
 * validate-levels.mjs
 *
 * Content quality contract for all levels:
 *   1. manifest.json is schema-valid
 *   2. starter/solution.js causes tests to FAIL (something to fix)
 *   3. starter/solution.js causes attack to FAIL (exploit works)
 *   4. reference/solution.js causes tests to PASS
 *   5. reference/solution.js causes attack to PASS (exploit blocked)
 *
 * Usage:
 *   node scripts/validate-levels.mjs           # validate all levels
 *   node scripts/validate-levels.mjs s1-l1     # validate a specific level id
 *
 * Exit code:
 *   0 — all levels pass the contract
 *   1 — one or more levels fail
 */
import { readdirSync, existsSync, readFileSync, copyFileSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const SEASONS_DIR = join(REPO_ROOT, 'seasons')

// ─── Load .env from repo root ─────────────────────────────────────────────────

function loadDotEnv() {
  const envPath = join(REPO_ROOT, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = val
  }
}

loadDotEnv()

// ─── API reachability check ───────────────────────────────────────────────────

function isApiReachable() {
  try {
    execFileSync('curl', ['-s', '--max-time', '2', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:3001/za/pb/v1/accounts'], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

const API_ONLINE = isApiReachable()

// ─── Schema validation ────────────────────────────────────────────────────────

const REQUIRED_MANIFEST_FIELDS = [
  'id', 'name', 'season', 'level', 'difficulty', 'apiRequired', 'tags',
]
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

function validateManifest(manifestPath, levelDir) {
  const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'))

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!(field in raw)) throw new Error(`manifest.json missing field: "${field}"`)
  }
  if (!VALID_DIFFICULTIES.includes(raw.difficulty)) {
    throw new Error(`Invalid difficulty "${raw.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}`)
  }
  if (typeof raw.apiRequired !== 'boolean') throw new Error('apiRequired must be a boolean')
  if (!Array.isArray(raw.tags)) throw new Error('tags must be an array')

  return raw
}

// ─── Test runner helper ───────────────────────────────────────────────────────

function runVitest(dir, vitestConfig, levelDir) {
  const outFile = join(tmpdir(), `validate-${randomBytes(6).toString('hex')}.json`)
  try {
    execFileSync('npx', [
      'vitest', 'run',
      '--reporter=json',
      `--outputFile=${outFile}`,
      '--config', vitestConfig,
      dir,
    ], {
      cwd: levelDir,
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: 'pipe',
    })
  } catch {
    // vitest exits non-zero on test failure — that's fine, we read the file
  }

  if (!existsSync(outFile)) return { success: false, numTotalTests: 0, testResults: [] }

  try {
    const result = JSON.parse(readFileSync(outFile, 'utf-8'))
    return result
  } finally {
    unlinkSync(outFile)
  }
}

function suiteResult(dir, levelDir) {
  const vitestConfig = join(levelDir, 'vitest.config.js')
  const result = runVitest(dir, vitestConfig, levelDir)
  const total = result.testResults?.reduce((n, f) => n + (f.assertionResults?.length ?? 0), 0) ?? 0
  return { passed: result.success === true, total }
}

// ─── Validate a single level ──────────────────────────────────────────────────

function validateLevel(levelDir) {
  const manifestPath = join(levelDir, 'manifest.json')
  if (!existsSync(manifestPath)) throw new Error('No manifest.json')

  const manifest = validateManifest(manifestPath, levelDir)
  const solutionPath = join(levelDir, 'solution.js')
  const starterPath = join(levelDir, 'starter', 'solution.js')
  const referencePath = join(levelDir, 'reference', 'solution.js')
  const testsDir = join(levelDir, 'tests')
  const attackDir = join(levelDir, 'attack')

  // Required files
  for (const [label, p] of [
    ['starter/solution.js', starterPath],
    ['reference/solution.js', referencePath],
    ['tests/', testsDir],
    ['attack/', attackDir],
    ['story.md', join(levelDir, 'story.md')],
    ['hints/hint-1.md', join(levelDir, 'hints', 'hint-1.md')],
    ['vitest.config.js', join(levelDir, 'vitest.config.js')],
  ]) {
    if (!existsSync(p)) throw new Error(`Missing required file: ${label}`)
  }

  const errors = []

  // ── Starter: tests must FAIL ──────────────────────────────────────────────
  copyFileSync(starterPath, solutionPath)
  try {
    const starterTests = suiteResult(testsDir, levelDir)
    if (starterTests.total === 0) {
      errors.push('Starter: behavior tests collected 0 tests')
    } else if (starterTests.passed) {
      errors.push('Starter: behavior tests all pass (expected some to fail — nothing to fix!)')
    }

    // ── Starter: attack must FAIL (exploit works before fix) ────────────────
    const starterAttack = suiteResult(attackDir, levelDir)
    if (starterAttack.total === 0) {
      errors.push('Starter: attack script collected 0 tests')
    } else if (starterAttack.passed) {
      errors.push('Starter: attack script passes on starter code (exploit should succeed before fix)')
    }
  } finally {
    if (existsSync(solutionPath)) unlinkSync(solutionPath)
  }

  // ── Reference: tests must PASS ───────────────────────────────────────────
  copyFileSync(referencePath, solutionPath)
  try {
    const refTests = suiteResult(testsDir, levelDir)
    if (refTests.total === 0) {
      errors.push('Reference: behavior tests collected 0 tests')
    } else if (!refTests.passed) {
      errors.push('Reference: behavior tests fail (reference solution is broken)')
    }

    // ── Reference: attack must PASS (exploit blocked after fix) ─────────────
    const refAttack = suiteResult(attackDir, levelDir)
    if (refAttack.total === 0) {
      errors.push('Reference: attack script collected 0 tests')
    } else if (!refAttack.passed) {
      errors.push('Reference: attack script fails (exploit not blocked by reference solution)')
    }
  } finally {
    if (existsSync(solutionPath)) unlinkSync(solutionPath)
  }

  return { manifest, errors }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const filterId = process.argv[2] ?? null

let totalLevels = 0
let failedLevels = 0

for (const seasonEntry of readdirSync(SEASONS_DIR).sort()) {
  const seasonDir = join(SEASONS_DIR, seasonEntry)
  for (const levelEntry of readdirSync(seasonDir).sort()) {
    const levelDir = join(seasonDir, levelEntry)
    if (!existsSync(join(levelDir, 'manifest.json'))) continue

    let manifest
    try {
      manifest = JSON.parse(readFileSync(join(levelDir, 'manifest.json'), 'utf-8'))
    } catch {
      continue
    }

    if (filterId && manifest.id !== filterId) continue

    totalLevels++
    process.stdout.write(`  Validating ${manifest.id} "${manifest.name}"... `)

    // Skip API-required levels when the mock API is not running
    if (manifest.apiRequired && !API_ONLINE) {
      console.log('⏭  (skipped — mock API not running)')
      totalLevels--
      continue
    }

    try {
      const { errors } = validateLevel(levelDir)
      if (errors.length === 0) {
        console.log('✓')
      } else {
        console.log('✗')
        for (const e of errors) console.error(`    ✗ ${e}`)
        failedLevels++
      }
    } catch (err) {
      console.log('✗')
      console.error(`    ✗ ${err.message}`)
      failedLevels++
    }
  }
}

if (totalLevels === 0) {
  console.error(`  No levels found${filterId ? ` matching "${filterId}"` : ''}.`)
  process.exit(1)
}

console.log(`\n  ${totalLevels - failedLevels}/${totalLevels} levels pass the content contract.`)

if (failedLevels > 0) {
  process.exit(1)
}
