import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildQualityVariant, checkQualityResult, LEVEL_QUALITY_CASES } from './level-quality.mjs'
import { readFileSync } from 'node:fs'

const mutation = { name: 'unsafe guard', changes: [['return true', 'return false']], rejectedBy: 'Q_GUARD:' }
const alternative = { name: 'valid guard', changes: [['return true', 'return Boolean(1)']] }

function report(status = 'passed', title = status === 'failed' ? 'Q_GUARD: checks policy' : 'Valid request', message = 'AssertionError: expected true to be false') {
  return {
    success: status === 'passed',
    exitCode: status === 'passed' ? 0 : 1,
    testResults: [{ assertionResults: [{ title, status, failureMessages: status === 'failed' ? [message] : [] }] }],
  }
}

test('rejects surviving mutations and accepts named assertion failures', () => {
  assert.match(checkQualityResult(mutation, { behavior: report(), attack: report() }), /survived/)
  assert.equal(checkQualityResult(mutation, { behavior: report(), attack: report('failed') }), null)
})

test('requires the designated assertion, not an unrelated failing test', () => {
  assert.match(checkQualityResult(mutation, { behavior: report(), attack: report('failed', 'Other assertion') }), /Expected one/)
})

test('valid alternatives must pass both suites', () => {
  assert.equal(checkQualityResult(alternative, { behavior: report(), attack: report() }), null)
  assert.match(checkQualityResult(alternative, { behavior: report(), attack: report('failed') }), /Valid alternative/)
  assert.match(checkQualityResult(alternative, { behavior: report() }), /Both/)
})

test('collection failures, runtime crashes and process errors are not mutation kills', () => {
  const invalid = [
    {},
    { success: false, testResults: [] },
    { success: false, testResults: [{ assertionResults: [] }] },
    { ...report(), executionError: 'timed out' },
    { ...report(), exitCode: 1 },
    report('failed', 'Q_GUARD: checks policy', 'TypeError: broken fixture'),
    { ...report(), success: false },
  ]
  for (const attack of invalid) {
    assert.notEqual(checkQualityResult(mutation, { behavior: report(), attack }), null)
  }
})

test('skipped, pending and todo tests never prove a quality case', () => {
  for (const status of ['skipped', 'pending', 'todo']) {
    assert.match(checkQualityResult(mutation, { behavior: report(), attack: report(status) }), /must execute/)
  }
})

test('source changes must apply exactly once and must change the reference', () => {
  assert.equal(buildQualityVariant('return true', mutation), 'return false')
  for (const source of ['return false', 'return true; return true']) {
    assert.throws(() => buildQualityVariant(source, mutation), /source anchor/)
  }
  assert.throws(() => buildQualityVariant('return true', { name: 'empty', changes: [] }), /no change/)
})

test('every enrolled level has negative and positive controls with current source anchors', () => {
  for (const [levelId, cases] of Object.entries(LEVEL_QUALITY_CASES)) {
    const [, season, level] = /^s(\d+)-l(\d+)$/.exec(levelId)
    const reference = readFileSync(new URL(`../seasons/season-${season}/level-${level}/reference/solution.js`, import.meta.url), 'utf8')
    assert.ok(cases.some(qualityCase => qualityCase.rejectedBy))
    assert.ok(cases.some(qualityCase => !qualityCase.rejectedBy))
    assert.equal(new Set(cases.map(qualityCase => qualityCase.name)).size, cases.length)
    for (const qualityCase of cases) assert.notEqual(buildQualityVariant(reference, qualityCase), reference)
  }
})