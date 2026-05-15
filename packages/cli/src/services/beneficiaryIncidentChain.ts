import type { ArcFlagEvidence } from '@investec-game/shared'
import { getArcFlagEvidence, getArcFlags } from '../db/progress.js'
import { formatEvidenceLine, latestEvidenceForFlag } from './arcEvidence.js'

type BeneficiaryRisk = 'ignored' | 'watched' | 'blocked'

export type BeneficiaryIncidentChainStatus = 'escalated' | 'monitored' | 'contained'

export interface BeneficiaryIncidentChainProjection {
  status: BeneficiaryIncidentChainStatus
  headline: string
  narrative: string
  implications: string[]
}

const INCIDENT_CHAIN_TABLE: Record<BeneficiaryRisk, BeneficiaryIncidentChainProjection> = {
  ignored: {
    status: 'escalated',
    headline: 'Escalation Path Remains Open',
    narrative: 'The early harmless-looking beneficiary remained under-defended and progressed into a broader incident chain.',
    implications: [
      'High-confidence containment requires additional manual verification checkpoints.',
      'Analysts must assume downstream payment narratives may include adversarial staging.',
    ],
  },
  watched: {
    status: 'monitored',
    headline: 'Escalation Path Is Being Tracked',
    narrative: 'The suspicious beneficiary stayed visible under monitoring, reducing surprise but still creating operational overhead.',
    implications: [
      'Escalation likelihood drops, but review queues remain active during peak load.',
      'Follow-on scenarios retain medium risk until policy enforcement is tightened.',
    ],
  },
  blocked: {
    status: 'contained',
    headline: 'Escalation Path Was Contained Early',
    narrative: 'The suspicious beneficiary pathway was disrupted before chaining into larger incident impact.',
    implications: [
      'Downstream scenarios inherit lower financial and operational blast radius.',
      'Analyst effort shifts from triage to preventive control tuning.',
    ],
  },
}

export function deriveIncidentChainFromBeneficiaryRisk(risk: BeneficiaryRisk): BeneficiaryIncidentChainProjection {
  return INCIDENT_CHAIN_TABLE[risk]
}

export function buildBossWrapUpFromIncidentChain(chain: BeneficiaryIncidentChainProjection): string {
  if (chain.status === 'contained') {
    return 'Boss wrap-up: your earlier beneficiary controls compressed the incident chain before it could compound.'
  }

  if (chain.status === 'monitored') {
    return 'Boss wrap-up: monitoring reduced surprise, but unresolved exposure still drove extra response overhead.'
  }

  return 'Boss wrap-up: unresolved early beneficiary risk amplified this boss incident path and response pressure.'
}

export function buildBeneficiaryIncidentChainAddendumForLevel(season: number, isBoss: boolean): string | null {
  if (season < 2) return null

  const { s1_beneficiary_risk: beneficiaryRisk } = getArcFlags()
  const chain = deriveIncidentChainFromBeneficiaryRisk(beneficiaryRisk)
  const evidence = latestEvidenceForFlag(getArcFlagEvidence(), 's1_beneficiary_risk')

  const lines: string[] = [
    '## Beneficiary Incident Chain',
    '',
    'Carry-forward impact: beneficiary decisions from Season 1 are now affecting downstream incident behavior.',
    '',
    `### ${chain.headline}`,
    `- Chain status: ${chain.status}`,
    `- Narrative: ${chain.narrative}`,
  ]

  for (const implication of chain.implications) {
    lines.push(`- Implication: ${implication}`)
  }

  lines.push(formatEvidenceLine(evidence, { missingMessage: 'no explicit beneficiary-risk signal recorded yet' }))

  if (isBoss) {
    lines.push('')
    lines.push('### Boss Wrap-up')
    lines.push(`- ${buildBossWrapUpFromIncidentChain(chain)}`)
  }

  return lines.join('\n')
}