# Season Boss: Reconciliation Rift

## Mission Brief

**The Briefing Desk:** Season 1 closes with a payout control room. FinFlow must authenticate, locate the right account, trace recent debit exposure, validate the beneficiary, and submit a retry-safe payment. Every earlier lesson is now part of one production path.

## Bug Report

The starter inspects only the first account page, skips beneficiary validation, and computes an idempotency key without sending it where the API expects it.

## Your Task

Edit `solution.js` and implement:

```js
export async function runSeasonOneBoss(clientId, clientSecret, accountId, payment, fromDate, toDate)
```

Required behavior:

1. Authenticate with OAuth2 client credentials.
2. Fetch all account pages and verify `accountId` exists.
3. Fetch transactions with date filtering and pagination.
4. Compute `recentDebitTotal` from absolute values of negative amounts.
5. Validate `payment.beneficiaryId`.
6. Submit payment with a deterministic `Idempotency-Key` derived from account and payment payload.
7. Return `{ paymentReference, recentDebitTotal, accountId }`.

## Threat

**The Red Team:** Settlement Rift retries the same payment and also attempts a non-existent beneficiary.

## Win Condition

Behavior tests and the Red Team pass when the orchestration is complete, retry-safe, and beneficiary-aware.
