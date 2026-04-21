# Hint 1 — Fetching the beneficiaries list

The beneficiaries endpoint follows the same pattern as accounts:

```
GET /za/pb/v1/accounts/beneficiaries
Authorization: Bearer <token>
```

Response:
```json
{
  "data": [ { "beneficiaryId": "ben-001", ... } ]
}
```

Implement `getBeneficiaries` first — make the fetch and return `json.data`.
