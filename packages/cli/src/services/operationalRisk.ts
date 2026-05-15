import type { ArcFlagEvidence, ArcFlags } from '@investec-game/shared'
import { getArcFlagEvidence, getArcFlags } from '../db/progress.js'
import { formatEvidenceLine, latestEvidenceForFlag } from './arcEvidence.js'

export type OperationalRiskBand = 'elevated' | 'guarded' | 'resilient'

export interface OperationalRiskProfile {
  band: OperationalRiskBand
  headline: string
  summary: string
  reviewNotes: string[]
}

const OPERATIONAL_RISK_INPUT_FLAGS = [
  's1_token_fix_depth',
  's2_state_discipline',
] as const

type OperationalRiskInputFlag = (typeof OPERATIONAL_RISK_INPUT_FLAGS)[number]

type TokenFixDepth = ArcFlags['s1_token_fix_depth']
type StateDiscipline = ArcFlags['s2_state_discipline']

const MATRIX: Record<TokenFixDepth, Record<StateDiscipline, OperationalRiskProfile>> = {
  patchy: {
    'eager-write': {
      band: 'elevated',
      headline: 'Operational Risk Is Elevated',
      summary: 'Patchy auth recovery plus eager state writes increase rollback pressure and incident recurrence risk.',
      reviewNotes: [
        'Apply stricter change review before shipping high-impact automation updates.',
        'Add manual reconciliation checkpoints for decline-path consistency.',
      ],
    },
    'approve-then-write': {
      band: 'guarded',
      headline: 'Operational Risk Is Guarded',
      summary: 'State updates are disciplined, but token remediation depth still creates avoidable auth churn.',
      reviewNotes: [
        'Prioritize hardening token renewal edge cases in the next sprint.',
      ],
    },
  },
  robust: {
    'eager-write': {
      band: 'guarded',
      headline: 'Operational Risk Is Guarded',
      summary: 'Authentication resilience is strong, but eager writes still leave decline-path drift exposure.',
      reviewNotes: [
        'Require targeted negative-path tests for all state mutation code paths.',
      ],
    },
    'approve-then-write': {
      band: 'resilient',
      headline: 'Operational Risk Is Resilient',
      summary: 'Robust token handling and disciplined state writes materially reduce downstream operational fragility.',
      reviewNotes: [
        'Maintain the current control posture with periodic regression checks.',
      ],
    },
  },
}

export function deriveOperationalRiskProfile(
  tokenFixDepth: TokenFixDepth,
  stateDiscipline: StateDiscipline
): OperationalRiskProfile {
  return MATRIX[tokenFixDepth][stateDiscipline]
}

export function getOperationalRiskProfile(): OperationalRiskProfile {
  const flags = getArcFlags()
  return deriveOperationalRiskProfile(flags.s1_token_fix_depth, flags.s2_state_discipline)
}

export function hasOperationalRiskEvidence(
  evidence: ArcFlagEvidence[] = getArcFlagEvidence()
): boolean {
  const seenFlags = new Set<OperationalRiskInputFlag>()

  for (const event of evidence) {
    if (isOperationalRiskInputFlag(event.flag)) {
      seenFlags.add(event.flag)
    }
  }

  return OPERATIONAL_RISK_INPUT_FLAGS.every((flag) => seenFlags.has(flag))
}

function isOperationalRiskInputFlag(flag: string): flag is OperationalRiskInputFlag {
  return OPERATIONAL_RISK_INPUT_FLAGS.includes(flag as OperationalRiskInputFlag)
}

export function buildOperationalRiskAddendumForSeason(season: number): string | null {
  if (season < 3) return null

  const flags = getArcFlags()
  const profile = deriveOperationalRiskProfile(flags.s1_token_fix_depth, flags.s2_state_discipline)
  const evidence = getArcFlagEvidence()

  const tokenEvidence = latestEvidenceForFlag(evidence, 's1_token_fix_depth')
  const stateEvidence = latestEvidenceForFlag(evidence, 's2_state_discipline')

  const lines: string[] = [
    '## Operational Risk Summary',
    '',
    'Carry-forward impact from early remediation quality is now shaping operational resilience.',
    '',
    `### ${profile.headline}`,
    `- Risk band: ${profile.band}`,
    `- Inputs: s1_token_fix_depth=${flags.s1_token_fix_depth}, s2_state_discipline=${flags.s2_state_discipline}`,
    `- Summary: ${profile.summary}`,
  ]

  for (const note of profile.reviewNotes) {
    lines.push(`- Review note: ${note}`)
  }

  lines.push(formatEvidenceLine(tokenEvidence, { prefix: '- Evidence (token fix depth)' }))
  lines.push(formatEvidenceLine(stateEvidence, { prefix: '- Evidence (state discipline)' }))

  return lines.join('\n')
}