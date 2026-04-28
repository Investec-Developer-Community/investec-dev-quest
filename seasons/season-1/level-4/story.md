# Beneficiary Blueprint

## Mission Brief

FinFlow has shipped a "Pay a Beneficiary" feature. It's been running for two weeks when the support team starts getting reports of failed payments — but the UI shows success.

## Bug Report

Support logs show failed payment attempts that the UI treated as successful. A tester can also construct a call with an arbitrary beneficiary ID, so the validation layer needs to prove the ID belongs to the profile before payment code continues.

## Your Task

Implement two functions that form the validation layer:

```js
// Fetch all beneficiaries on the profile
export async function getBeneficiaries(token)

// Validate that beneficiaryId exists in the beneficiaries list
// Returns true if found
// Throws Error('Beneficiary not found') if not
export async function validateBeneficiary(token, beneficiaryId)
```

### API endpoint

```
GET /za/pb/v1/accounts/beneficiaries
```

Response shape:
```json
{
  "data": [
    {
      "beneficiaryId": "ben-001",
      "beneficiaryName": "Alice Nkosi",
      ...
    }
  ]
}
```

### Rules

- `getBeneficiaries` must return the array from `data`
- `validateBeneficiary` must call `getBeneficiaries` and check if the ID exists
- If the ID is not found, throw `Error('Beneficiary not found')`

## Threat

The attack tries to validate a beneficiary ID that is not present in the profile's beneficiary list.

## Win Condition

Both test suites must pass.

The attack script will attempt to validate a beneficiary ID that does **not** exist.
