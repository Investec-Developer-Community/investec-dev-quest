# Hint 1 — Building the URL with query parameters

The API accepts `fromDate` and `toDate` as query string parameters:

```
GET /za/pb/v1/accounts/acc-001/transactions?fromDate=2026-04-01&toDate=2026-04-30
```

Use the `URL` constructor to safely build this — it handles encoding for you:

```js
const url = new URL(`${BASE_URL}/za/pb/v1/accounts/${accountId}/transactions`)
url.searchParams.set('fromDate', fromDate)
url.searchParams.set('toDate', toDate)
```

Then fetch `url.toString()` with an `Authorization: Bearer <token>` header.
