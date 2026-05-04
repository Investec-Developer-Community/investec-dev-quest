import { execa } from 'execa'
import { join } from 'path'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import type { TestRunResult } from '@investec-game/shared'
import { REPO_ROOT } from '../paths.js'

function tempJsonPath(): string {
  return join(tmpdir(), `investec-game-${randomBytes(6).toString('hex')}.json`)
}

interface VitestJsonResult {
  testResults?: Array<{
    testFilePath: string
    assertionResults?: Array<{
      title: string
      status: 'passed' | 'failed' | 'pending' | 'todo'
      failureMessages?: string[]
      duration?: number
    }>
    testResults?: Array<{
      title: string
      status: 'passed' | 'failed' | 'pending' | 'todo'
      failureMessages?: string[]
      duration?: number
    }>
    status: 'passed' | 'failed'
    message?: string
  }>
  success: boolean
  numFailedTests?: number
  numTotalTests?: number
}

export async function runTests(
  testsDir: string,
  levelId: string
): Promise<TestRunResult> {
  return runSuite(testsDir, levelId)
}

export async function runAttack(
  attackDir: string,
  levelId: string
): Promise<TestRunResult> {
  return runSuite(attackDir, levelId)
}

async function runSuite(dir: string, levelId: string): Promise<TestRunResult> {
  const vitestConfig = join(dir, '..', 'vitest.config.js')
  const outFile = tempJsonPath()

  try {
    const result = await execa(
      'vitest',
      [
        'run',
        '--reporter=json',
        `--outputFile=${outFile}`,
        '--config',
        vitestConfig,
        dir,
      ],
      {
        cwd: REPO_ROOT,
        reject: false,
        preferLocal: true,
        localDir: REPO_ROOT,
        timeout: 60_000,
        env: { ...process.env, FORCE_COLOR: '0' },
      }
    )

    if (!existsSync(outFile)) {
      const failureDetails = result.failed
        ? ` (exit ${result.exitCode ?? 'unknown'}): ${result.shortMessage ?? result.stderr ?? 'no stderr'}`
        : ''
      return {
        passed: false,
        total: 0,
        failed: 0,
        tests: [],
        error: `Vitest did not produce output for level ${levelId}${failureDetails}`,
      }
    }

    const raw = readFileSync(outFile, 'utf-8')
    return parseVitestJson(raw)
  } catch (err) {
    return {
      passed: false,
      total: 0,
      failed: 0,
      tests: [],
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    if (existsSync(outFile)) unlinkSync(outFile)
  }
}

function parseVitestJson(raw: string): TestRunResult {
  let parsed: VitestJsonResult
  try {
    parsed = JSON.parse(raw) as VitestJsonResult
  } catch {
    return {
      passed: false,
      total: 0,
      failed: 0,
      tests: [],
      error: `JSON parse error. Raw output:\n${raw.slice(0, 500)}`,
    }
  }

  const tests: TestRunResult['tests'] = []

  for (const file of parsed.testResults ?? []) {
    const assertions = file.assertionResults ?? file.testResults ?? []
    for (const t of assertions) {
      tests.push({
        name: t.title,
        status: t.status === 'passed' ? 'pass' : t.status === 'pending' ? 'skip' : 'fail',
        message: t.failureMessages?.[0],
        duration: t.duration,
      })
    }
  }

  const failed = tests.filter((t) => t.status === 'fail').length
  const total = tests.length

  // Guard: a suite that collects 0 tests is never a real pass.
  // This prevents false-greens when vitest config or glob doesn't match.
  if (total === 0) {
    return {
      passed: false,
      total: 0,
      failed: 0,
      tests: [],
      error:
        'No tests were collected. Check the test file path and vitest.config.js.',
    }
  }

  return {
    passed: parsed.success,
    total,
    failed,
    tests,
  }
}
