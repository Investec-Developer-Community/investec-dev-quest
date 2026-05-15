import type { ArcFlags } from '@investec-game/shared'

export const ARC_DEFAULT_FLAGS: ArcFlags = {
  s1_token_fix_depth: 'patchy',
  s1_logging_maturity: 'none',
  s1_beneficiary_risk: 'ignored',
  s2_state_discipline: 'eager-write',
  s4_tool_trust_mode: 'first-match',
  s4_prompt_hygiene: 'lax',
  s4_loop_safety: 'absent',
}