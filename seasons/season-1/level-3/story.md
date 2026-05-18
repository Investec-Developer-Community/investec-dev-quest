# Transaction Trail

## Mission Brief

**The Briefing Desk:** Compliance needs an April transaction pack for a simulated Johannesburg business account. The current report drags in older history and misses paginated records, which would make an audit trail unreliable.

## Bug Report

The transaction client calls the endpoint, but it does not send the requested date window and stops after the first page.

## Your Task

Edit `solution.js` and implement:

```js
export async function getTransactions(token, accountId, fromDate, toDate)
```

Rules:

- Call `GET /za/pb/v1/accounts/:accountId/transactions`.
- Send `fromDate` and `toDate` as query parameters.
- Follow `meta.nextCursor` until it is `null`.
- Return all matching transactions as a flat array.
- Return `[]` when the API has no records for the range.
- Do not client-side filter; send the date window to the API.

## Threat

**The Red Team:** Statement Flood asks for a narrow date range and checks that unrelated months do not leak into the report.

## Win Condition

Behavior tests and the Red Team pass when the result contains every page in the requested range and nothing outside it.
