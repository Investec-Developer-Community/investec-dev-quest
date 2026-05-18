# Debrief: Token Trouble

## What changed

The fetch path now refreshes once on `401`, updates the shared token store, and stops if the refreshed token also fails.

## Why it matters

Long-running services need recovery paths, but unbounded retries can hide outages and create noisy failure storms.

## Production habit

Make recovery explicit, observable, and bounded.

