# Beneficiary Blueprint

## Mission Brief

**The Briefing Desk:** A payment screen is showing success while invalid beneficiary IDs slip through the validation layer. In a real South African payments flow, that is not a cosmetic bug. It is a trust failure before money moves.

## Bug Report

The starter fetches beneficiaries, but `validateBeneficiary` approves the path without proving the supplied ID belongs to the profile.

## Your Task

Edit `solution.js` and implement:

```js
export async function getBeneficiaries(token)
export async function validateBeneficiary(token, beneficiaryId)
```

Rules:

- `getBeneficiaries` calls `GET /za/pb/v1/accounts/beneficiaries`.
- Return the response `data` array.
- `validateBeneficiary` must call `getBeneficiaries`.
- Return `true` when `beneficiaryId` exists.
- Throw `Error('Beneficiary not found')` when it does not.

## Threat

**The Red Team:** Phantom Beneficiary presents an ID that is not in the profile and tries to continue toward payment.

## Win Condition

Behavior tests and the Red Team pass when known beneficiaries validate and unknown beneficiaries stop the flow.
