import type { ArcFlagEvidence, ArcFlagKey, ArcFlags } from '@investec-game/shared'
import { getArcFlagEvidence, getArcFlags } from '../db/progress.js'
import { formatEvidenceLine, latestEvidenceByFlag } from './arcEvidence.js'
import { ARC_DEFAULT_FLAGS } from './arcModel.js'

export const BASELINE_ARC_FLAGS: ArcFlags = { ...ARC_DEFAULT_FLAGS }

type ArcFlagValue = ArcFlags[ArcFlagKey]

interface FlagNote {
  headline: string
  consequence: string
}

export interface ArcPostmortemSection {
  flag: ArcFlagKey
  value: ArcFlags[ArcFlagKey]
  headline: string
  consequence: string
  evidenceLine: string
}

const FLAG_NOTES: {
  [K in ArcFlagKey]: Record<ArcFlags[K], FlagNote>
} = {
  s1_token_fix_depth: {
    patchy: {
      headline: 'Token fix remained tactical',
      consequence: 'Later incidents still require careful token-expiry triage.',
    },
    robust: {
      headline: 'Token fix hardened early',
      consequence: 'Downstream auth incidents show lower recurrence and cleaner recovery.',
    },
  },
  s1_logging_maturity: {
    none: {
      headline: 'Logging posture stayed minimal',
      consequence: 'Incident timelines later in the season are harder to reconstruct.',
    },
    basic: {
      headline: 'Logging baseline established',
      consequence: 'Some root-cause analysis becomes possible, but with blind spots.',
    },
    forensic: {
      headline: 'Forensic logging achieved',
      consequence: 'Later investigations gain high-confidence traceability and clearer ownership.',
    },
  },
  s1_beneficiary_risk: {
    ignored: {
      headline: 'Beneficiary risk was under-addressed',
      consequence: 'Suspicious payee activity remains a credible escalation vector.',
    },
    watched: {
      headline: 'Beneficiary risk was monitored',
      consequence: 'Escalation risk is reduced, but monitoring overhead persists.',
    },
    blocked: {
      headline: 'Beneficiary risk was actively blocked',
      consequence: 'Incident chain potential is materially reduced in later scenarios.',
    },
  },
  s2_state_discipline: {
    'eager-write': {
      headline: 'State mutations remain eager',
      consequence: 'Financial controls retain rollback and reconciliation pressure.',
    },
    'approve-then-write': {
      headline: 'State discipline improved',
      consequence: 'Declined events avoid state drift, reducing reconciliation debt.',
    },
  },
  s4_tool_trust_mode: {
    'first-match': {
      headline: 'Tool trust policy is permissive',
      consequence: 'Registry poisoning and look-alike tool risk remains elevated.',
    },
    'trusted-only': {
      headline: 'Tool trust policy is strict',
      consequence: 'Later agent workflows show stronger resistance to poisoned entries.',
    },
  },
  s4_prompt_hygiene: {
    lax: {
      headline: 'Prompt hygiene remains lax',
      consequence: 'Instruction-like payloads can leak into downstream decision context.',
    },
    strict: {
      headline: 'Prompt hygiene is strict',
      consequence: 'Suspicious instruction payloads are consistently contained and redacted.',
    },
  },
  s4_loop_safety: {
    absent: {
      headline: 'Loop safety is not enforced',
      consequence: 'Consecutive tool-call loops remain an operational reliability risk.',
    },
    present: {
      headline: 'Loop safety controls are present',
      consequence: 'Consecutive call loops are detected before runaway agent behavior grows.',
    },
  },
}

function getFlagNote(flag: ArcFlagKey, value: ArcFlagValue): FlagNote {
  const table = FLAG_NOTES as Record<ArcFlagKey, Record<string, FlagNote>>
  const note = table[flag][String(value)]
  if (!note) {
    throw new Error(`Missing arc postmortem mapping for ${flag}=${String(value)}`)
  }
  return note
}

export function buildArcPostmortemAddendum(): string | null {
  const sections = deriveArcPostmortemSections(getArcFlags(), getArcFlagEvidence())
  if (sections.length === 0) return null

  const lines: string[] = [
    '## Arc Postmortem (Dynamic)',
    '',
    'Earlier implementation choices are now shaping downstream incident posture.',
    '',
  ]

  for (const section of sections) {
    const { flag, value, headline, consequence, evidenceLine } = section
    lines.push(`### ${headline}`)
    lines.push(`- Current stance: ${flag} = ${value}`)
    lines.push(`- Consequence: ${consequence}`)
    lines.push(evidenceLine)
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

export function deriveArcPostmortemSections(
  flags: ArcFlags,
  evidence: ArcFlagEvidence[]
): ArcPostmortemSection[] {
  const latestByFlag = latestEvidenceByFlag(evidence)
  const unlocked = (Object.keys(flags) as ArcFlagKey[])
    .filter((flag) => flags[flag] !== BASELINE_ARC_FLAGS[flag])

  return unlocked.map((flag) => {
    const value = flags[flag] as ArcFlagValue
    const note = getFlagNote(flag, value)
    return {
      flag,
      value,
      headline: note.headline,
      consequence: note.consequence,
      evidenceLine: formatEvidenceLine(latestByFlag[flag]),
    }
  })
}