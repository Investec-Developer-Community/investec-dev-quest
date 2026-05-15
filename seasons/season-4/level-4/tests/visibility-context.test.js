import { describe, it, expect } from 'vitest'
import { deriveIncidentVisibilityFromLogging } from '../../../../packages/cli/src/services/incidentVisibility.ts'

describe('incident visibility branches', () => {
  it('maps none logging maturity to opaque visibility', () => {
    const profile = deriveIncidentVisibilityFromLogging('none')
    expect(profile.quality).toBe('opaque')
    expect(profile.summary).toContain('sparse breadcrumbs')
  })

  it('maps basic logging maturity to partial visibility', () => {
    const profile = deriveIncidentVisibilityFromLogging('basic')
    expect(profile.quality).toBe('partial')
    expect(profile.summary).toContain('manual stitching')
  })

  it('maps forensic logging maturity to forensic visibility', () => {
    const profile = deriveIncidentVisibilityFromLogging('forensic')
    expect(profile.quality).toBe('forensic')
    expect(profile.summary).toContain('high confidence')
  })
})
