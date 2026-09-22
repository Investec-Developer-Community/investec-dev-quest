export const LEVEL_QUALITY_CASES = {
  's1-l2': [
    {
      name: 'ignores cached expiry',
      changes: [['return Date.now() < tokenStore.expiresAt', 'return true']],
      rejectedBy: 'A_S1L2_REFRESHES_EXPIRED_CACHE:',
    },
    {
      name: 'accepts a second unauthorized response',
      changes: [["if (second.status === 401) throw new Error('Token refresh failed')", 'if (second.status === 401) return second.json()']],
      rejectedBy: 'A_S1L2_BOUNDED_RETRY:',
    },
    {
      name: 'valid URL-object fetch',
      changes: [['fetch(`${BASE_URL}/identity/v2/oauth2/token`, {', 'fetch(new URL(`${BASE_URL}/identity/v2/oauth2/token`), {']],
    },
  ],
  's4-l2': [
    {
      name: 'trusts truthy approval',
      changes: [['context?.humanApproved === true', 'Boolean(context?.humanApproved)']],
      rejectedBy: 'Q_S4L2_EXPLICIT_APPROVAL:',
    },
    {
      name: 'valid reordered approval guard',
      changes: [["risk === 'high' && !humanApproved", "!humanApproved && risk === 'high'"]],
    },
  ],
  's4-l5': [
    {
      name: 'trusts truthy registry metadata',
      changes: [['tool?.trusted === true', 'Boolean(tool?.trusted)']],
      rejectedBy: 'Q_S4L5_EXPLICIT_TRUST:',
    },
    {
      name: 'resolves a tool-name prefix',
      changes: [['tool?.name === name', 'tool?.name?.startsWith(name)']],
      rejectedBy: 'Q_S4L5_EXACT_NAME:',
    },
    {
      name: 'valid filtered trusted selection',
      changes: [['matches.find((tool) => tool?.trusted === true)', 'matches.filter((tool) => tool?.trusted === true)[0]']],
    },
  ],
}

export function buildQualityVariant(reference, qualityCase) {
  let source = reference
  for (const [before, after] of qualityCase.changes) {
    if (!before || before === after || source.split(before).length !== 2) {
      throw new Error(`Quality case "${qualityCase.name}" has a stale or ambiguous source anchor`)
    }
    source = source.replace(before, after)
  }
  if (source === reference) throw new Error(`Quality case "${qualityCase.name}" made no change`)
  return source
}

export function checkQualityResult(qualityCase, reports) {
  const assertions = []
  for (const [suite, report] of Object.entries(reports)) {
    const files = report.testResults ?? []
    if (report.executionError || files.length === 0 || files.some(file => !file.assertionResults?.length)) {
      return `${suite}: runner or collection failure; not evidence of a blocked mutation`
    }
    const tests = files.flatMap(file => file.assertionResults)
    if (tests.some(test => !['passed', 'failed'].includes(test.status))) {
      return `${suite}: skipped or unfinished tests; all quality checks must execute`
    }
    const failures = tests.filter(test => test.status === 'failed')
    if (report.success !== (failures.length === 0) || report.exitCode !== (failures.length === 0 ? 0 : 1)) {
      return `${suite}: inconsistent test report or process failure`
    }
    if (failures.some(test => !test.failureMessages?.some(message => message.startsWith('AssertionError:')))) {
      return `${suite}: runtime failure; a named assertion must reject the mutation`
    }
    assertions.push(...tests)
  }
  if (!reports.behavior || !reports.attack) return 'Both behavior and attack reports are required'

  if (!qualityCase.rejectedBy) {
    return assertions.every(test => test.status === 'passed')
      ? null
      : 'Valid alternative was rejected; both suites must pass'
  }

  if (assertions.every(test => test.status === 'passed')) {
    return 'Insecure mutation survived both suites'
  }
  const targeted = assertions.filter(test => test.title.startsWith(qualityCase.rejectedBy))
  if (targeted.length !== 1 || targeted[0].status !== 'failed') {
    return `Expected one failing assertion named "${qualityCase.rejectedBy}"`
  }
  return null
}