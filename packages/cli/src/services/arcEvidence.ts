import type { ArcFlagEvidence, ArcFlagKey } from '@investec-game/shared'

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
  options?: { prefix?: string; missingMessage?: string }
): string {
  const prefix = options?.prefix ?? '- Evidence'
  const missingMessage = options?.missingMessage ?? 'no explicit signal recorded yet'

  if (!evidence) {
    return `${prefix}: ${missingMessage}`
  }

  const signals = evidence.testSignals.length > 0
    ? evidence.testSignals.join(', ')
    : 'none'

  return `${prefix}: ${signals} (${evidence.levelId}, ${evidence.rubricVersion})`
}