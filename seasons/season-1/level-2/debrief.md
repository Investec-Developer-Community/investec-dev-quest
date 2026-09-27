# Debrief: Token Trouble

## What changed

The fetch path now reuses a valid bearer token, records its expiry from `expires_in`, refreshes only when needed, and stops if the refreshed token also fails.

## Why it matters

Access tokens are intentionally reusable for their lifetime. Fetching a token for every request adds avoidable latency and auth load, while unbounded retries can still hide outages and create noisy failure storms.

## Production habit

Cache tokens until expiry, refresh deliberately, and keep recovery explicit, observable, and bounded.

## Try it for real

- Real Investec access tokens expire after about 30 minutes, so this cache-and-refresh pattern is exactly what a long-running integration needs. See the [Authorisation API (OAuth)](https://developer.investec.com/api-reference/SA%20Open%20API%20-%20Authorization).
- Try it against the [sandbox](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox): fetch one token and reuse it across several account calls.

