# Season Boss: Reconciliation Rift

## Mission Brief

FinFlow is closing out month-end and needs one final cross-check before releasing payouts.

The payout engine must authenticate correctly, locate the target account across paginated account data, validate the beneficiary, summarize recent debit exposure from transactions, and submit an idempotent payment so retries cannot double-charge users.

## Bug Report

The incident review found duplicate payouts and invalid beneficiaries slipping through in retry scenarios. In some cases, the wrong account was selected because only the first page of accounts was inspected.

Your team needs one hardened orchestration function that combines all core Season 1 skills into one workflow.

## Your Task

Edit `solution.js` to implement:

```js
export async function runSeasonOneBoss(clientId, clientSecret, accountId, payment, fromDate, toDate)
```

Where `payment` has this shape:

```js
{
  beneficiaryId: 'ben-001',
  amount: 500.0,
  myReference: 'Month-end payout',
  theirReference: 'Settlement'
}
```

### Required behavior

1. Authenticate with OAuth2 client credentials and return a usable access token.
2. Fetch all accounts with cursor-based pagination and verify `accountId` exists.
3. Fetch transactions for the account with cursor pagination and date filtering.
4. Compute `recentDebitTotal` from the filtered transactions as the sum of absolute values of negative amounts.
5. Validate that `payment.beneficiaryId` exists in the beneficiaries list.
6. Submit payment to `/paymultiple` using a deterministic `Idempotency-Key` derived from account + payment payload.
7. Return:

```js
{
  paymentReference: '<PaymentReferenceNumber>',
  recentDebitTotal: <number>,
  accountId: '<accountId>'
}
```

## Threat

The attack script retries the same payment and also tries a non-existent beneficiary.

If your workflow is not idempotent or skips beneficiary validation, the attack passes through and the level fails.

## Win Condition

Both test suites must pass:

- behavior tests prove the end-to-end workflow is correct
- attack tests prove retries and invalid beneficiaries are blocked
