import { describe, it, expect } from 'vitest'
import { runSeasonOneBoss } from '../solution.js'

const CLIENT_ID = process.env.GAME_API_CLIENT_ID ?? 'game_client_id'
const CLIENT_SECRET = process.env.GAME_API_CLIENT_SECRET ?? 'game_client_secret'

describe('runSeasonOneBoss', () => {
  it('returns payment reference, debit total, and account id for a valid flow', async () => {
    const result = await runSeasonOneBoss(
      CLIENT_ID,
      CLIENT_SECRET,
      'acc-001',
      {
        beneficiaryId: 'ben-001',
        amount: 500.0,
        myReference: 'Month-end payout',
        theirReference: 'Settlement',
      },
      '2026-04-01',
      '2026-04-30'
    )

    expect(result.accountId).toBe('acc-001')
    expect(typeof result.paymentReference).toBe('string')
    expect(result.paymentReference.length).toBeGreaterThan(0)
    expect(result.recentDebitTotal).toBe(523)
  })

  it('finds acc-002 even when account lookup requires pagination', async () => {
    const result = await runSeasonOneBoss(
      CLIENT_ID,
      CLIENT_SECRET,
      'acc-002',
      {
        beneficiaryId: 'ben-002',
        amount: 275.0,
        myReference: 'Ops payout',
        theirReference: 'Ops',
      },
      '2026-04-01',
      '2026-04-30'
    )

    expect(result.accountId).toBe('acc-002')
    expect(result.recentDebitTotal).toBe(1199)
  })

  it('throws when beneficiary is not found', async () => {
    await expect(
      runSeasonOneBoss(
        CLIENT_ID,
        CLIENT_SECRET,
        'acc-001',
        {
          beneficiaryId: 'ben-999',
          amount: 500.0,
          myReference: 'Month-end payout',
          theirReference: 'Settlement',
        },
        '2026-04-01',
        '2026-04-30'
      )
    ).rejects.toThrow('Beneficiary not found')
  })
})
