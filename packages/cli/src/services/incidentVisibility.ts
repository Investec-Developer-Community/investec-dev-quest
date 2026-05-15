import type { ArcFlagEvidence } from '@investec-game/shared'
import { getArcFlagEvidence, getArcFlags } from '../db/progress.js'
import { formatEvidenceLine, latestEvidenceForFlag } from './arcEvidence.js'

type LoggingMaturity = 'none' | 'basic' | 'forensic'

export type IncidentVisibilityQuality = 'opaque' | 'partial' | 'forensic'

export interface IncidentVisibilityProfile {
  quality: IncidentVisibilityQuality
  headline: string
  summary: string
  constraints: string[]
}

export function deriveIncidentVisibilityFromLogging(logging: LoggingMaturity): IncidentVisibilityProfile {
  if (logging === 'forensic') {
    return {
      quality: 'forensic',
      headline: 'Forensic Visibility Available',
      summary: 'Investigators can trace requests, decisions, and ownership with high confidence.',
      constraints: [
        'Cross-system correlation is reliable enough for rapid incident containment.',
      ],
    }
  }

  if (logging === 'basic') {
    return {
      quality: 'partial',
      headline: 'Partial Incident Visibility',
      summary: 'Incident reconstruction is possible but requires manual stitching of context.',
      constraints: [
        'Some root-cause paths remain ambiguous without full request lineage.',
      ],
    }
  }

  return {
    quality: 'opaque',
    headline: 'Limited Incident Visibility',
    summary: 'Investigations rely on sparse breadcrumbs and can miss key causal links.',
    constraints: [
      'Escalations are slower because decision provenance is under-instrumented.',
    ],
  }
}

export function getIncidentVisibilityProfile(): IncidentVisibilityProfile {
  const { s1_logging_maturity: logging } = getArcFlags()
  return deriveIncidentVisibilityFromLogging(logging)
}

export function buildIncidentVisibilityAddendumForSeason(season: number): string | null {
  if (season < 2) return null

  const profile = getIncidentVisibilityProfile()
  const evidence = latestEvidenceForFlag(getArcFlagEvidence(), 's1_logging_maturity')

  const lines: string[] = [
    '## Incident Visibility Context',
    '',
    'Carry-forward impact from earlier logging decisions now affects investigative clarity.',
    '',
    `### ${profile.headline}`,
    `- Visibility quality: ${profile.quality}`,
    `- Impact: ${profile.summary}`,
  ]

  for (const constraint of profile.constraints) {
    lines.push(`- Constraint: ${constraint}`)
  }

  lines.push(formatEvidenceLine(evidence, { missingMessage: 'no explicit logging signal recorded yet' }))

  return lines.join('\n')
}