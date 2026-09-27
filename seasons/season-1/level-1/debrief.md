# Debrief: First Contact

## What changed

The client now uses caller-supplied credentials, follows every account page, and totals balances across the full account set.

## Why it matters

Authentication bugs and first-page assumptions are quiet failures. They can look correct in demos while corrupting production views.

## Production habit

Trust explicit inputs, not hidden constants. Treat pagination as part of the contract, not an edge case.

## Try it for real

- Get a real token with the [Authorisation API (OAuth) quickstart](https://developer.investec.com/api-reference/SA%20Open%20API%20-%20Authorization#description/quickstart-curl). It uses the same client-credentials flow you just fixed.
- No Investec account? Call the [Private Bank API sandbox](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox) with its published sandbox credentials, then follow the [accounts quickstart](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/quickstarts).

