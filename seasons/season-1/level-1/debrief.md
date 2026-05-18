# Debrief: First Contact

## What changed

The client now uses caller-supplied credentials, follows every account page, and totals balances across the full account set.

## Why it matters

Authentication bugs and first-page assumptions are quiet failures. They can look correct in demos while corrupting production views.

## Production habit

Trust explicit inputs, not hidden constants. Treat pagination as part of the contract, not an edge case.

