# Debrief: Beneficiary Blueprint

## What changed

Beneficiary validation now checks the fetched profile list and rejects unknown IDs before payment logic continues.

## Why it matters

Payment flows need proof that the target belongs to the profile, not just a truthy validation step.

## Production habit

Validate identity boundaries before irreversible actions.

## Try it for real

- The [Private Bank API](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information) exposes a beneficiaries endpoint. In production, beneficiaries belong to a user's profile rather than the account, so always validate against the list the calling profile can actually see.
- Per the [developer FAQ](https://developer.investec.com/individuals), you must have paid a beneficiary through Investec Online before paying them via the API.

