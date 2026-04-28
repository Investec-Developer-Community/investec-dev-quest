# Debrief: Webhook Whiplash

## What changed

The fixed implementation rebuilds the expected HMAC from the exact timestamp and raw body, verifies the `sha256=` signature format, compares equal-length buffers, and uses a timing-safe comparison.

## Why it matters

Webhook verification protects downstream payment workflows from forged events. Partial comparisons, parsed-body signing, and normal string equality can all leave subtle openings.

## Production habit

Verify signatures over the exact bytes received, reject malformed signatures early, and use constant-time comparison for secrets or digests.