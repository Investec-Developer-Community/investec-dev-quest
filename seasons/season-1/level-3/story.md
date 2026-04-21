# Transaction Trail

## The situation

FinFlow's compliance team needs to generate monthly statements. They've built a report that calls your transaction API client and filters transactions by date range.

The problem: the report is showing transactions from **every month**, not just the requested one. An audit is coming up, and sending regulators the wrong data is a serious problem.

You dig into the code and find two bugs:

1. The `fromDate` and `toDate` parameters are never passed to the API — the endpoint receives them but the client ignores them
2. The client only fetches the **first page** of transactions and stops, missing older records

## Your task

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

## Win condition

Both the behavior tests and the attack script must pass.

The attack will request a narrow date window and verify that **only transactions in that window are returned** — not the full history.
