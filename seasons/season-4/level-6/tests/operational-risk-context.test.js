import { describe, it, expect } from 'vitest'
import { deriveOperationalRiskProfile } from '../../../../packages/cli/src/services/operationalRisk.ts'

describe('operational risk matrix', () => {
  it('maps patchy + eager-write to elevated risk', () => {
    const profile = deriveOperationalRiskProfile('patchy', 'eager-write')
    expect(profile.band).toBe('elevated')
    expect(profile.summary).toContain('rollback pressure')
  })

  it('maps robust + approve-then-write to resilient risk', () => {
    const profile = deriveOperationalRiskProfile('robust', 'approve-then-write')
    expect(profile.band).toBe('resilient')
    expect(profile.summary).toContain('materially reduce')
  })

  it('maps mixed quality pairs to guarded risk', () => {
    const a = deriveOperationalRiskProfile('patchy', 'approve-then-write')
    const b = deriveOperationalRiskProfile('robust', 'eager-write')
    expect(a.band).toBe('guarded')
    expect(b.band).toBe('guarded')
  })
})
