# Debrief: Webhook Whiplash

## What changed

The verifier now rebuilds the expected HMAC, checks the `sha256=` format, compares equal-length buffers, and uses timing-safe comparison.

## Why it matters

Partial signature checks let forged events reach payment logic.

## Production habit

Verify signatures over the exact received payload and reject malformed proofs early.

## Try it for real

- Card code can call your own services from `afterTransaction`. Sign those calls with a secret stored in the IDE's `env.json`, and verify them like this on the receiving side. See the [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code) and the [card IDE guide](https://developer.investec.com/individuals).

