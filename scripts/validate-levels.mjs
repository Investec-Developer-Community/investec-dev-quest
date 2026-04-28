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
const TEMPLATE_DIR = join(REPO_ROOT, 'templates', 'level-template')
const REQUIRED_STORY_SECTIONS = ['Mission Brief', 'Bug Report', 'Your Task', 'Threat', 'Win Condition']

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
    const output = execFileSync('curl', ['-s', '--max-time', '2', 'http://localhost:3001/health'], { stdio: 'pipe' }).toString()
    return output.includes('investec-mock-api')
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

// ─── Content structure validation ────────────────────────────────────────────

function validateStorySections(storyPath) {
  const story = readFileSync(storyPath, 'utf-8')
  const missing = REQUIRED_STORY_SECTIONS.filter((section) => {
    const pattern = new RegExp(`^##\\s+${section}\\s*$`, 'm')
    return !pattern.test(story)
  })

  if (missing.length > 0) {
    throw new Error(`story.md missing standard section(s): ${missing.join(', ')}`)
  }
}

function validateHints(hintsDir) {
  const hintFiles = readdirSync(hintsDir)
    .filter((name) => /^hint-\d+\.md$/.test(name))
    .sort()

  if (hintFiles.length !== 2) {
    throw new Error(`Expected exactly 2 hint files, found ${hintFiles.length}`)
  }

  for (const expected of ['hint-1.md', 'hint-2.md']) {
    if (!hintFiles.includes(expected)) throw new Error(`Missing required hint file: hints/${expected}`)
  }
}

function validateTemplate() {
  const errors = []
  const requiredTemplatePaths = [
    ['manifest.json', join(TEMPLATE_DIR, 'manifest.json')],
    ['story.md', join(TEMPLATE_DIR, 'story.md')],
    ['starter/solution.js', join(TEMPLATE_DIR, 'starter', 'solution.js')],
    ['tests/', join(TEMPLATE_DIR, 'tests')],
    ['attack/', join(TEMPLATE_DIR, 'attack')],
    ['hints/', join(TEMPLATE_DIR, 'hints')],
    ['hints/hint-1.md', join(TEMPLATE_DIR, 'hints', 'hint-1.md')],
    ['hints/hint-2.md', join(TEMPLATE_DIR, 'hints', 'hint-2.md')],
    ['reference/solution.js', join(TEMPLATE_DIR, 'reference', 'solution.js')],
    ['debrief.md', join(TEMPLATE_DIR, 'debrief.md')],
    ['vitest.config.js', join(TEMPLATE_DIR, 'vitest.config.js')],
  ]

  for (const [label, path] of requiredTemplatePaths) {
    if (!existsSync(path)) errors.push(`Template missing required file: ${label}`)
  }

  try {
    validateStorySections(join(TEMPLATE_DIR, 'story.md'))
  } catch (err) {
    errors.push(`Template ${err.message}`)
  }

  try {
    validateHints(join(TEMPLATE_DIR, 'hints'))
  } catch (err) {
    errors.push(`Template ${err.message}`)
  }

  return errors
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
  const storyPath = join(levelDir, 'story.md')
  const hintsDir = join(levelDir, 'hints')

  // Required files
  for (const [label, p] of [
    ['starter/solution.js', starterPath],
    ['reference/solution.js', referencePath],
    ['tests/', testsDir],
    ['attack/', attackDir],
    ['story.md', storyPath],
    ['hints/', hintsDir],
    ['hints/hint-1.md', join(hintsDir, 'hint-1.md')],
    ['hints/hint-2.md', join(hintsDir, 'hint-2.md')],
    ['vitest.config.js', join(levelDir, 'vitest.config.js')],
  ]) {
    if (!existsSync(p)) throw new Error(`Missing required file: ${label}`)
  }

  validateStorySections(storyPath)
  validateHints(hintsDir)

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
let failedQualityGates = 0

process.stdout.write('  Validating level template... ')
const templateErrors = validateTemplate()
if (templateErrors.length === 0) {
  console.log('✓')
} else {
  console.log('✗')
  for (const e of templateErrors) console.error(`    ✗ ${e}`)
  failedQualityGates++
}

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

if (failedLevels > 0 || failedQualityGates > 0) {
  process.exit(1)
}
