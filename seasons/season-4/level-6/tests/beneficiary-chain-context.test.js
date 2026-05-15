import { describe, it, expect } from 'vitest'
import {
  deriveIncidentChainFromBeneficiaryRisk,
  buildBossWrapUpFromIncidentChain,
} from '../../../../packages/cli/src/services/beneficiaryIncidentChain.ts'

describe('beneficiary incident chain variants', () => {
  it('snapshot: ignored risk escalates incident chain', () => {
    const projection = deriveIncidentChainFromBeneficiaryRisk('ignored')
    expect(projection).toMatchInlineSnapshot(`
      {
        "headline": "Escalation Path Remains Open",
        "implications": [
          "High-confidence containment requires additional manual verification checkpoints.",
          "Analysts must assume downstream payment narratives may include adversarial staging.",
        ],
        "narrative": "The early harmless-looking beneficiary remained under-defended and progressed into a broader incident chain.",
        "status": "escalated",
      }
    `)
  })

  it('snapshot: watched risk keeps chain monitored', () => {
    const projection = deriveIncidentChainFromBeneficiaryRisk('watched')
    expect(projection).toMatchInlineSnapshot(`
      {
        "headline": "Escalation Path Is Being Tracked",
        "implications": [
          "Escalation likelihood drops, but review queues remain active during peak load.",
          "Follow-on scenarios retain medium risk until policy enforcement is tightened.",
        ],
        "narrative": "The suspicious beneficiary stayed visible under monitoring, reducing surprise but still creating operational overhead.",
        "status": "monitored",
      }
    `)
  })

  it('snapshot: blocked risk contains chain', () => {
    const projection = deriveIncidentChainFromBeneficiaryRisk('blocked')
    expect(projection).toMatchInlineSnapshot(`
      {
        "headline": "Escalation Path Was Contained Early",
        "implications": [
          "Downstream scenarios inherit lower financial and operational blast radius.",
          "Analyst effort shifts from triage to preventive control tuning.",
        ],
        "narrative": "The suspicious beneficiary pathway was disrupted before chaining into larger incident impact.",
        "status": "contained",
      }
    `)
  })

  it('snapshot: boss wrap-up variant per chain status', () => {
    const escalated = buildBossWrapUpFromIncidentChain(deriveIncidentChainFromBeneficiaryRisk('ignored'))
    const monitored = buildBossWrapUpFromIncidentChain(deriveIncidentChainFromBeneficiaryRisk('watched'))
    const contained = buildBossWrapUpFromIncidentChain(deriveIncidentChainFromBeneficiaryRisk('blocked'))

    expect({ escalated, monitored, contained }).toMatchInlineSnapshot(`
      {
        "contained": "Boss wrap-up: your earlier beneficiary controls compressed the incident chain before it could compound.",
        "escalated": "Boss wrap-up: unresolved early beneficiary risk amplified this boss incident path and response pressure.",
        "monitored": "Boss wrap-up: monitoring reduced surprise, but unresolved exposure still drove extra response overhead.",
      }
    `)
  })
})
