# Transaction Trail

## Mission Brief

FinFlow's compliance team needs to generate monthly statements. They've built a report that calls your transaction API client and filters transactions by date range.

## Bug Report

The report is showing transactions from **every month**, not just the requested one. It also misses records when the API returns more than one page. An audit is coming up, and sending regulators the wrong data is a serious problem.

## Your Task

Fix `getTransactions` so it:

1. Passes `fromDate` and `toDate` as query parameters to the API
2. **Follows pagination** — keeps fetching until `meta.nextCursor` is `null`
3. Returns **all** matching transactions as a flat array

### Export required

```js
export async function getTransactions(token, accountId, fromDate, toDate)
```

- `token` — Bearer token string
- `accountId` — e.g. `'acc-001'`
- `fromDate` — `'YYYY-MM-DD'` string (inclusive)
- `toDate` — `'YYYY-MM-DD'` string (inclusive)

Returns an array of transaction objects.

### API endpoint

```
GET /za/pb/v1/accounts/:accountId/transactions
  ?fromDate=YYYY-MM-DD
  &toDate=YYYY-MM-DD
  &cursor=<cursor>
```

Follow `meta.nextCursor` for subsequent pages.

### Rules

- If there are no transactions in the range, return an empty array `[]`
- Do not client-side filter — trust the API's date filtering
- All pages must be fetched before returning

## Threat

The attack requests a narrow date window and verifies the client does not return unrelated history or silently stop at the first page.

## Win Condition

Both the behavior tests and the attack script must pass.

The attack will request a narrow date window and verify that **only transactions in that window are returned**.
