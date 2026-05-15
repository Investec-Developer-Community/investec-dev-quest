import { describe, it, expect } from 'vitest'
import {
  deriveArcPostmortemSections,
  BASELINE_ARC_FLAGS,
} from '../../../../packages/cli/src/services/arcPostmortem.ts'

describe('arc postmortem section generation', () => {
  it('returns no sections when all flags remain at baseline', () => {
    const sections = deriveArcPostmortemSections(BASELINE_ARC_FLAGS, [])
    expect(sections).toEqual([])
  })

  it('produces deterministic unlocked sections with evidence breadcrumbs', () => {
    const flags = {
      ...BASELINE_ARC_FLAGS,
      s1_logging_maturity: 'forensic',
      s1_beneficiary_risk: 'blocked',
    }

    const evidence = [
      {
        flag: 's1_logging_maturity',
        value: 'forensic',
        levelId: 's1-l3',
        writtenAt: '2026-05-15T12:00:00.000Z',
        testSignals: ['OBS_S1L3_EMITS_STRUCTURED_LOGS'],
        rubricVersion: 'v1',
      },
      {
        flag: 's1_beneficiary_risk',
        value: 'blocked',
        levelId: 's1-l4',
        writtenAt: '2026-05-15T12:05:00.000Z',
        testSignals: ['A_S1L4_BLOCKS_ELEVATED_RISK_BENEFICIARY'],
        rubricVersion: 'v1',
      },
    ]

    const sections = deriveArcPostmortemSections(flags, evidence)
    expect(sections).toHaveLength(2)
    expect(sections.map((s) => s.flag).sort()).toEqual(['s1_beneficiary_risk', 's1_logging_maturity'])
    expect(sections[0].evidenceLine).toContain('Evidence:')
  })
})
