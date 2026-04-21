# Hint 2 — Look-before-you-leap validation

`validateBeneficiary` must call `getBeneficiaries` and then check whether the requested ID is present:

```js
export async function validateBeneficiary(token, accountId, beneficiaryId) {
  const beneficiaries = await getBeneficiaries(token, accountId)
  const found = beneficiaries.some((b) => b.beneficiaryId === beneficiaryId)

  if (!found) throw new Error('Beneficiary not found')

  return true
}
```

`Array.some()` returns `false` if no element matches — it's the right tool here.

Note: because you fetch the beneficiaries for the specific `accountId`, a cross-account beneficiary ID will naturally not appear in the list — the account isolation is enforced automatically.
