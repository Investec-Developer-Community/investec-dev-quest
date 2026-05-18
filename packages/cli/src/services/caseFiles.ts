import type { ArcFlagEvidence, ArcFlags, CaseFileEntry, LevelManifest } from '@investec-game/shared'
import { formatFlagLabel, formatSignalLabel } from './arcEvidence.js'
import { deriveIncidentVisibilityFromLogging } from './incidentVisibility.js'
import { deriveIncidentChainFromBeneficiaryRisk } from './beneficiaryIncidentChain.js'
import { deriveOperationalRiskProfile, hasOperationalRiskEvidence } from './operationalRisk.js'

function uniqueSignalsForLevel(levelId: string, evidence: ArcFlagEvidence[]): string[] {
  const seen = new Set<string>()
  const labels: string[] = []

  for (const row of evidence) {
    if (row.levelId !== levelId) continue
    for (const signal of row.testSignals) {
      if (seen.has(signal)) continue
      seen.add(signal)
      labels.push(formatSignalLabel(signal))
    }
  }

  return labels
}

function changedFlagSummariesForLevel(levelId: string, flags: ArcFlags, evidence: ArcFlagEvidence[]): string[] {
  const changed = new Set<string>()
  const lines: string[] = []

  for (const row of evidence) {
    if (row.levelId !== levelId) continue
    if (changed.has(row.flag)) continue
    changed.add(row.flag)

    const key = row.flag as keyof ArcFlags
    lines.push(`${formatFlagLabel(row.flag)}=${String(flags[key])}`)
  }

  return lines
}

function buildProductionHabit(signalLabels: string[], tags: string[]): string {
  if (signalLabels.length > 0) {
    return `Promote explicit test-proven controls such as: ${signalLabels.slice(0, 2).join('; ')}`
  }

  if (tags.length > 0) {
    return `Reinforce ${tags.slice(0, 2).join(' + ')} safeguards with boundary validation and negative-path tests.`
  }

  return 'Prefer explicit guardrails at trust boundaries, then prove them with behavior and attack tests.'
}

function buildConsequenceSummary(manifest: LevelManifest, flags: ArcFlags, flagChanges: string[], evidence: ArcFlagEvidence[]): string {
  const outcomes: string[] = []

  if (flagChanges.length > 0) {
    outcomes.push(`Arc posture updated via ${flagChanges.join(', ')}`)
  }

  if (manifest.season >= 2) {
    const visibility = deriveIncidentVisibilityFromLogging(flags.s1_logging_maturity)
    outcomes.push(`Incident visibility now ${visibility.quality}`)

    const chain = deriveIncidentChainFromBeneficiaryRisk(flags.s1_beneficiary_risk)
    outcomes.push(`Beneficiary chain is ${chain.status}`)
  }

  if (manifest.season >= 3) {
    if (hasOperationalRiskEvidence(evidence)) {
      const risk = deriveOperationalRiskProfile(flags.s1_token_fix_depth, flags.s2_state_discipline)
      outcomes.push(`Operational risk band: ${risk.band}`)
    } else {
      outcomes.push('Operational risk band: not assessed yet')
    }
  }

  if (outcomes.length === 0) {
    return 'No downstream posture change recorded yet; baseline arc stance remains active.'
  }

  return outcomes.join(' | ')
}

export function deriveCaseFileEntry(
  manifest: LevelManifest,
  flags: ArcFlags,
  evidence: ArcFlagEvidence[],
  existingCreatedAt?: string
): CaseFileEntry {
  const signalLabels = uniqueSignalsForLevel(manifest.id, evidence)
  const flagChanges = changedFlagSummariesForLevel(manifest.id, flags, evidence)
  const adversaryBlocked = manifest.attackName
    ? `${manifest.attackName} blocked`
    : 'Level exploit blocked'

  return {
    levelId: manifest.id,
    levelName: manifest.name,
    season: manifest.season,
    level: manifest.level,
    createdAt: existingCreatedAt ?? new Date().toISOString(),
    adversaryBlocked,
    productionHabit: buildProductionHabit(signalLabels, manifest.tags),
    downstreamConsequence: buildConsequenceSummary(manifest, flags, flagChanges, evidence),
    signalLabels,
    flagChanges,
  }
}

export function summarizeCaseFile(entry: CaseFileEntry): string[] {
  return [
    `- Adversary blocked: ${entry.adversaryBlocked}`,
    `- Production habit: ${entry.productionHabit}`,
    `- Downstream consequence: ${entry.downstreamConsequence}`,
  ]
}
