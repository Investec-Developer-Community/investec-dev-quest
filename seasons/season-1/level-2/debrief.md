# Debrief: Token Trouble

## What changed

The fetch path now reuses a valid bearer token, records its expiry from `expires_in`, refreshes only when needed, and stops if the refreshed token also fails.

## Why it matters

Access tokens are intentionally reusable for their lifetime. Fetching a token for every request adds avoidable latency and auth load, while unbounded retries can still hide outages and create noisy failure storms.

## Production habit

Cache tokens until expiry, refresh deliberately, and keep recovery explicit, observable, and bounded.
