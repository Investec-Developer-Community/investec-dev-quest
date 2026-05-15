import type { ArcFlagKey, ArcFlags, TestRunResult } from '@investec-game/shared'
import { applyArcFlagWrites, type ArcFlagWriteInput } from '../db/progress.js'

interface SignalContext {
  byId: Record<string, boolean>
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function collectPassingTestNames(result: TestRunResult): string[] {
  if (result.error) return []
  return result.tests.filter((t) => t.status === 'pass').map((t) => t.name)
}

function hasAnyFragment(passedNames: string[], fragments: string[]): boolean {
  const normalized = passedNames.map(normalize)
  return fragments.some((fragment) => {
    const needle = normalize(fragment)
    return normalized.some((name) => name.includes(needle))
  })
}

function hasSignal(passedNames: string[], signalId: string, aliases: string[] = []): boolean {
  return hasAnyFragment(passedNames, [signalId, ...aliases])
}

function buildSignalContext(levelId: string, testResults: TestRunResult, attackResults: TestRunResult): SignalContext {
  const passedNames = [
    ...collectPassingTestNames(testResults),
    ...collectPassingTestNames(attackResults),
  ]

  const byId: Record<string, boolean> = {}

  if (levelId === 's1-l2') {
    byId['A_S1L2_RETRY_ON_401_ONCE'] = hasSignal(passedNames, 'A_S1L2_RETRY_ON_401_ONCE', [
      'automatically refreshes an expired token and returns data',
    ])
    byId['A_S1L2_UPDATES_TOKEN_STORE'] = hasSignal(passedNames, 'A_S1L2_UPDATES_TOKEN_STORE', [
      'updates tokenStore.token after a successful refresh',
    ])
    byId['A_S1L2_BOUNDED_RETRY'] = hasSignal(passedNames, 'A_S1L2_BOUNDED_RETRY', [
      'throws "Token refresh failed" when credentials are removed from env',
    ])
  }

  if (levelId === 's1-l3') {
    byId['OBS_S1L3_EMITS_STRUCTURED_LOGS'] = hasSignal(passedNames, 'OBS_S1L3_EMITS_STRUCTURED_LOGS', ['structured log'])
    byId['OBS_S1L3_HAS_REQUEST_CORRELATION_ID'] = hasSignal(passedNames, 'OBS_S1L3_HAS_REQUEST_CORRELATION_ID', ['correlation id'])
    byId['OBS_S1L3_LOGS_DECISION_REASON_CODES'] = hasSignal(passedNames, 'OBS_S1L3_LOGS_DECISION_REASON_CODES', ['reason code'])
  }

  if (levelId === 's1-l4') {
    byId['A_S1L4_REJECTS_UNKNOWN_BENEFICIARY'] = hasSignal(passedNames, 'A_S1L4_REJECTS_UNKNOWN_BENEFICIARY', [
      'throws "Beneficiary not found" for an ID that does not exist',
    ])
    byId['A_S1L4_TAGS_ELEVATED_RISK_BENEFICIARY'] = hasSignal(passedNames, 'A_S1L4_TAGS_ELEVATED_RISK_BENEFICIARY', [
      'elevated risk',
    ])
    byId['A_S1L4_BLOCKS_ELEVATED_RISK_BENEFICIARY'] = hasSignal(passedNames, 'A_S1L4_BLOCKS_ELEVATED_RISK_BENEFICIARY', [
      'blocks elevated risk',
      'throws for a fabricated ID',
    ])
  }

  if (levelId === 's2-l5') {
    byId['A_S2L5_DECLINED_DOES_NOT_MUTATE_STATE'] = hasSignal(passedNames, 'A_S2L5_DECLINED_DOES_NOT_MUTATE_STATE', [
      'does NOT update daily_spend when a transaction is declined',
    ])
  }

  if (levelId === 's4-l1') {
    byId['A_S4L1_REJECTS_PREFIX_TOOL_BYPASS'] = hasSignal(passedNames, 'A_S4L1_REJECTS_PREFIX_TOOL_BYPASS', [
      'denies look-alike tools with allowlisted prefixes',
    ])
  }

  if (levelId === 's4-l4') {
    byId['A_S4L4_FLAGS_INSTRUCTION_LIKE_DESCRIPTION'] = hasSignal(passedNames, 'A_S4L4_FLAGS_INSTRUCTION_LIKE_DESCRIPTION', [
      'flags injection-like bracketed instructions as unsafe',
    ])
    byId['A_S4L4_REDACTS_SUSPICIOUS_TEXT_IN_SUMMARY'] = hasSignal(passedNames, 'A_S4L4_REDACTS_SUSPICIOUS_TEXT_IN_SUMMARY', [
      'redact',
    ])
  }

  if (levelId === 's4-l5') {
    byId['A_S4L5_PREFERS_TRUSTED_OVER_FIRST_MATCH'] = hasSignal(passedNames, 'A_S4L5_PREFERS_TRUSTED_OVER_FIRST_MATCH', [
      'prefers trusted tool when untrusted duplicate appears first',
    ])
    byId['A_S4L5_RETURNS_NULL_IF_ONLY_UNTRUSTED'] = hasSignal(passedNames, 'A_S4L5_RETURNS_NULL_IF_ONLY_UNTRUSTED', [
      'returns null when only untrusted variants exist',
    ])
  }

  if (levelId === 's4-l6') {
    byId['A_S4L6_DETECTS_CONSECUTIVE_TOOL_LOOP_DESPITE_PARAM_CHURN'] = hasSignal(passedNames, 'A_S4L6_DETECTS_CONSECUTIVE_TOOL_LOOP_DESPITE_PARAM_CHURN', [
      'detects threshold consecutive calls to same tool even when params differ',
    ])
    byId['A_S4L6_DOES_NOT_FLAG_NON_CONSECUTIVE_REUSE'] = hasSignal(passedNames, 'A_S4L6_DOES_NOT_FLAG_NON_CONSECUTIVE_REUSE', [
      'does not flag mixed tool sequence as loop',
    ])
  }

  return { byId }
}

function write(
  out: ArcFlagWriteInput[],
  flag: ArcFlagKey,
  value: ArcFlags[ArcFlagKey],
  testSignals: string[]
): void {
  out.push({ flag, value, testSignals })
}

export function computeFlagWrites(
  levelId: string,
  testResults: TestRunResult,
  attackResults: TestRunResult,
  _levelComplete: boolean
): ArcFlagWriteInput[] {
  // We intentionally evaluate writes from explicit passing signals even on partial runs.
  // This makes every enum branch reachable and evidence-backed across iterative attempts.

  const { byId } = buildSignalContext(levelId, testResults, attackResults)
  const writes: ArcFlagWriteInput[] = []

  if (levelId === 's1-l2') {
    const retry = byId['A_S1L2_RETRY_ON_401_ONCE'] === true
    const updatesStore = byId['A_S1L2_UPDATES_TOKEN_STORE'] === true
    const boundedRetry = byId['A_S1L2_BOUNDED_RETRY'] === true

    if (retry && updatesStore && boundedRetry) {
      write(writes, 's1_token_fix_depth', 'robust', [
        'A_S1L2_RETRY_ON_401_ONCE',
        'A_S1L2_UPDATES_TOKEN_STORE',
        'A_S1L2_BOUNDED_RETRY',
      ])
    } else if (retry) {
      write(writes, 's1_token_fix_depth', 'patchy', [
        'A_S1L2_RETRY_ON_401_ONCE',
      ])
    }
  }

  if (levelId === 's1-l3') {
    const structured = byId['OBS_S1L3_EMITS_STRUCTURED_LOGS'] === true
    const correlation = byId['OBS_S1L3_HAS_REQUEST_CORRELATION_ID'] === true
    const reasonCodes = byId['OBS_S1L3_LOGS_DECISION_REASON_CODES'] === true

    if (structured && correlation && reasonCodes) {
      write(writes, 's1_logging_maturity', 'forensic', [
        'OBS_S1L3_EMITS_STRUCTURED_LOGS',
        'OBS_S1L3_HAS_REQUEST_CORRELATION_ID',
        'OBS_S1L3_LOGS_DECISION_REASON_CODES',
      ])
    } else if (structured) {
      write(writes, 's1_logging_maturity', 'basic', [
        'OBS_S1L3_EMITS_STRUCTURED_LOGS',
      ])
    } else {
      write(writes, 's1_logging_maturity', 'none', [])
    }
  }

  if (levelId === 's1-l4') {
    const rejectsUnknown = byId['A_S1L4_REJECTS_UNKNOWN_BENEFICIARY'] === true
    const tagsElevated = byId['A_S1L4_TAGS_ELEVATED_RISK_BENEFICIARY'] === true
    const blocksElevated = byId['A_S1L4_BLOCKS_ELEVATED_RISK_BENEFICIARY'] === true

    if (rejectsUnknown && tagsElevated && blocksElevated) {
      write(writes, 's1_beneficiary_risk', 'blocked', [
        'A_S1L4_REJECTS_UNKNOWN_BENEFICIARY',
        'A_S1L4_TAGS_ELEVATED_RISK_BENEFICIARY',
        'A_S1L4_BLOCKS_ELEVATED_RISK_BENEFICIARY',
      ])
    } else if (rejectsUnknown && tagsElevated) {
      write(writes, 's1_beneficiary_risk', 'watched', [
        'A_S1L4_REJECTS_UNKNOWN_BENEFICIARY',
        'A_S1L4_TAGS_ELEVATED_RISK_BENEFICIARY',
      ])
    } else {
      write(writes, 's1_beneficiary_risk', 'ignored', [])
    }
  }

  if (levelId === 's2-l5') {
    if (byId['A_S2L5_DECLINED_DOES_NOT_MUTATE_STATE'] === true) {
      write(writes, 's2_state_discipline', 'approve-then-write', [
        'A_S2L5_DECLINED_DOES_NOT_MUTATE_STATE',
      ])
    } else {
      write(writes, 's2_state_discipline', 'eager-write', [])
    }
  }

  if (levelId === 's4-l1' || levelId === 's4-l5') {
    const passesPrefix = byId['A_S4L1_REJECTS_PREFIX_TOOL_BYPASS'] === true
    const prefersTrusted = byId['A_S4L5_PREFERS_TRUSTED_OVER_FIRST_MATCH'] === true
    const rejectsUntrustedOnly = byId['A_S4L5_RETURNS_NULL_IF_ONLY_UNTRUSTED'] === true
    const trustedOnly = (levelId === 's4-l1' && passesPrefix)
      || (levelId === 's4-l5' && prefersTrusted && rejectsUntrustedOnly)

    if (trustedOnly) {
      write(writes, 's4_tool_trust_mode', 'trusted-only',
        levelId === 's4-l1'
          ? ['A_S4L1_REJECTS_PREFIX_TOOL_BYPASS']
          : ['A_S4L5_PREFERS_TRUSTED_OVER_FIRST_MATCH', 'A_S4L5_RETURNS_NULL_IF_ONLY_UNTRUSTED']
      )
    } else {
      write(writes, 's4_tool_trust_mode', 'first-match', [])
    }
  }

  if (levelId === 's4-l4') {
    const flagsInjection = byId['A_S4L4_FLAGS_INSTRUCTION_LIKE_DESCRIPTION'] === true
    const redacts = byId['A_S4L4_REDACTS_SUSPICIOUS_TEXT_IN_SUMMARY'] === true

    if (flagsInjection && redacts) {
      write(writes, 's4_prompt_hygiene', 'strict', [
        'A_S4L4_FLAGS_INSTRUCTION_LIKE_DESCRIPTION',
        'A_S4L4_REDACTS_SUSPICIOUS_TEXT_IN_SUMMARY',
      ])
    } else {
      write(writes, 's4_prompt_hygiene', 'lax', [])
    }
  }

  if (levelId === 's4-l6') {
    const detects = byId['A_S4L6_DETECTS_CONSECUTIVE_TOOL_LOOP_DESPITE_PARAM_CHURN'] === true
    const noFalsePositive = byId['A_S4L6_DOES_NOT_FLAG_NON_CONSECUTIVE_REUSE'] === true

    if (detects && noFalsePositive) {
      write(writes, 's4_loop_safety', 'present', [
        'A_S4L6_DETECTS_CONSECUTIVE_TOOL_LOOP_DESPITE_PARAM_CHURN',
        'A_S4L6_DOES_NOT_FLAG_NON_CONSECUTIVE_REUSE',
      ])
    } else {
      write(writes, 's4_loop_safety', 'absent', [])
    }
  }

  return writes
}

export function applyFlagWritesFromResults(
  levelId: string,
  testResults: TestRunResult,
  attackResults: TestRunResult,
  levelComplete: boolean
): ArcFlagWriteInput[] {
  const writes = computeFlagWrites(levelId, testResults, attackResults, levelComplete)
  if (writes.length > 0) {
    applyArcFlagWrites(levelId, writes)
  }
  return writes
}
