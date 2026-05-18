# Debrief: Webhook Whiplash

## What changed

The verifier now rebuilds the expected HMAC, checks the `sha256=` format, compares equal-length buffers, and uses timing-safe comparison.

## Why it matters

Partial signature checks let forged events reach payment logic.

## Production habit

Verify signatures over the exact received payload and reject malformed proofs early.

