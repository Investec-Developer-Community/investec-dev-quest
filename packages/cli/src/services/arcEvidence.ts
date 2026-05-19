import type { ArcFlagEvidence, ArcFlagKey } from '@investec-game/shared'

const FLAG_LABELS: Record<ArcFlagKey, string> = {
  s1_token_fix_depth: 'Token Fix Depth',
  s1_logging_maturity: 'Logging Maturity',
  s1_beneficiary_risk: 'Beneficiary Risk',
  s2_state_discipline: 'State Discipline',
  s4_tool_trust_mode: 'Tool Trust Mode',
  s4_prompt_hygiene: 'Prompt Hygiene',
  s4_loop_safety: 'Loop Safety',
}

const SIGNAL_LABELS: Record<string, string> = {
  A_S1L2_REUSES_VALID_TOKEN: 'Reuses valid cached tokens across requests',
  A_S1L2_REFRESHES_EXPIRED_CACHE: 'Refreshes cached tokens after expiry',
  A_S1L2_RETRY_ON_401_ONCE: 'Retries once after a 401 token expiry',
  A_S1L2_UPDATES_TOKEN_STORE: 'Updates in-memory token after refresh',
  A_S1L2_BOUNDED_RETRY: 'Stops after bounded retry attempts',
  OBS_S1L3_EMITS_STRUCTURED_LOGS: 'Emits structured operational logs',
  OBS_S1L3_HAS_REQUEST_CORRELATION_ID: 'Includes request correlation IDs',
  OBS_S1L3_LOGS_DECISION_REASON_CODES: 'Logs decision reason codes',
  A_S1L4_REJECTS_UNKNOWN_BENEFICIARY: 'Rejects unknown beneficiaries',
  A_S1L4_TAGS_ELEVATED_RISK_BENEFICIARY: 'Tags elevated-risk beneficiaries',
  A_S1L4_BLOCKS_ELEVATED_RISK_BENEFICIARY: 'Blocks elevated-risk beneficiaries',
  A_S2L5_DECLINED_DOES_NOT_MUTATE_STATE: 'Declined transactions do not mutate state',
  A_S4L1_REJECTS_PREFIX_TOOL_BYPASS: 'Rejects prefix-based tool bypass attempts',
  A_S4L4_FLAGS_INSTRUCTION_LIKE_DESCRIPTION: 'Flags instruction-like descriptions',
  A_S4L4_REDACTS_SUSPICIOUS_TEXT_IN_SUMMARY: 'Redacts suspicious text in summaries',
  A_S4L5_PREFERS_TRUSTED_OVER_FIRST_MATCH: 'Prefers trusted tools over first registry match',
  A_S4L5_RETURNS_NULL_IF_ONLY_UNTRUSTED: 'Returns no tool when only untrusted entries exist',
  A_S4L6_DETECTS_CONSECUTIVE_TOOL_LOOP_DESPITE_PARAM_CHURN: 'Detects consecutive tool loops despite parameter churn',
  A_S4L6_DOES_NOT_FLAG_NON_CONSECUTIVE_REUSE: 'Avoids false positives on non-consecutive reuse',
}

export function latestEvidenceByFlag(evidence: ArcFlagEvidence[]): Partial<Record<ArcFlagKey, ArcFlagEvidence>> {
  const latest: Partial<Record<ArcFlagKey, ArcFlagEvidence>> = {}

  for (const item of evidence) {
    const key = item.flag as ArcFlagKey
    const existing = latest[key]
    if (!existing || item.writtenAt > existing.writtenAt) {
      latest[key] = item
    }
  }

  return latest
}

export function formatFlagLabel(flag: string): string {
  return FLAG_LABELS[flag as ArcFlagKey] ?? flag
}

export function formatSignalLabel(signal: string): string {
  return SIGNAL_LABELS[signal] ?? signal
}

export function formatSignalList(signals: string[], options?: { raw?: boolean }): string {
  if (signals.length === 0) return 'none'
  if (options?.raw) return signals.join(', ')
  return signals.map((signal) => formatSignalLabel(signal)).join(', ')
}

export function latestEvidenceForFlag(evidence: ArcFlagEvidence[], flag: string): ArcFlagEvidence | null {
  const matches = evidence.filter((item) => item.flag === flag)
  if (matches.length === 0) return null

  let latest: ArcFlagEvidence | null = null
  for (const item of matches) {
    if (!latest || item.writtenAt > latest.writtenAt) latest = item
  }
  return latest
}

export function formatEvidenceLine(
  evidence: ArcFlagEvidence | null | undefined,
  options?: { prefix?: string; missingMessage?: string; rawSignals?: boolean }
): string {
  const prefix = options?.prefix ?? '- Evidence'
  const missingMessage = options?.missingMessage ?? 'no explicit signal recorded yet'

  if (!evidence) {
    return `${prefix}: ${missingMessage}`
  }

  const signals = formatSignalList(
    evidence.testSignals,
    options?.rawSignals === true ? { raw: true } : undefined
  )

  return `${prefix}: ${signals} (${evidence.levelId}, ${evidence.rubricVersion})`
}
