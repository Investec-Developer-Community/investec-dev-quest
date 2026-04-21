# Beneficiary Blueprint

## The situation

FinFlow has shipped a "Pay a Beneficiary" feature. It's been running for two weeks when the support team starts getting reports of failed payments — but the UI shows success.

After digging through logs, you find the issue: **the code doesn't check whether the beneficiary actually exists** before submitting the payment. It just blindly fires a payment to whatever ID the user provides. When the payment API rejects it with a 404, that error gets swallowed somewhere and the user sees a success screen.

Worse, a penetration tester on the team has shown that a user can construct an API call to pay any arbitrary beneficiary ID — not just their own beneficiaries. The validation layer is completely missing.

## Your task

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

## Win condition

Both test suites must pass.

The attack script will attempt to validate a beneficiary ID that does **not** exist. The buggy starter always returns `true`; the reference correctly throws.
