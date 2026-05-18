# Debrief: Country Control

## What changed

The country rule now normalizes the country code, approves only ZA and NA, and denies everything else.

## Why it matters

Allowlist controls fail when the deny path is implied instead of enforced.

## Production habit

Default-deny at trust boundaries, then make allowed cases explicit.

