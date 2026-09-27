import { describe, it, expect } from 'vitest'
import { GENESIS_HASH, appendEntry, verifyChain } from '../solution.js'

function buildLog() {
  const log = []
  appendEntry(log, { decision: 'approved', amount: 1200, merchant: 'Karoo Coffee' })
  appendEntry(log, { decision: 'declined', amount: 45000, merchant: 'Lucky Spin Casino' })
  appendEntry(log, { decision: 'approved', amount: 380, merchant: 'Gautrain' })
  return log
}

describe('verifyChain — intact logs', () => {
  it('treats an empty log as valid', () => {
    expect(verifyChain([])).toEqual({ valid: true })
  })

  it('verifies an untouched log', () => {
    expect(verifyChain(buildLog())).toEqual({ valid: true })
  })

  it('links each entry to the previous hash', () => {
    const log = buildLog()
    expect(log[0].prevHash).toBe(GENESIS_HASH)
    expect(log[1].prevHash).toBe(log[0].hash)
  })
})

describe('verifyChain — reporting', () => {
  it('reports brokenAt for an event edited without rehashing', () => {
    const log = buildLog()
    log[1] = { ...log[1], event: { ...log[1].event, amount: 1 } }
    expect(verifyChain(log)).toEqual({ valid: false, brokenAt: 1 })
  })

  it('reports brokenAt 0 when the first entry does not start from the genesis hash', () => {
    const log = buildLog()
    log[0] = { ...log[0], prevHash: 'f'.repeat(64) }
    expect(verifyChain(log)).toEqual({ valid: false, brokenAt: 0 })
  })
})
