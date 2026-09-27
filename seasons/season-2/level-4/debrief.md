# Debrief: Country Control

## What changed

The country rule now normalizes the country code, approves only ZA and NA, and denies everything else.

## Why it matters

Allowlist controls fail when the deny path is implied instead of enforced.

## Production habit

Default-deny at trust boundaries, then make allowed cases explicit.

## Try it for real

- Try a default-deny country rule in the card IDE simulator before deploying it. See the [card IDE guide](https://developer.investec.com/individuals).
- Prefer a no-code start? Investec Online also offers simple card rules (merchant, category, or transaction limits). Code gives you the explicit allow/deny logic you just built. See the [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code).

