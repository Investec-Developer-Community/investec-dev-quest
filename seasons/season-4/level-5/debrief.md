# Debrief: Registry Verifier

## What changed

Tool resolution now requires an exact trusted match and ignores untrusted duplicates.

## Why it matters

Registry order is not a security model.

## Production habit

Resolve tools by identity and trust, not by first match.

## Try it for real

- When you pull in [community libraries and tools](https://investec.gitbook.io/programmable-banking-community-wiki/get-building/community-libraries-and-tools) for Investec APIs, pin exact versions and verify sources. It's the same trust-before-first-match rule, applied to dependencies.

