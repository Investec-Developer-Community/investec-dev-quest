# Callback Trap

## Mission Brief

**The Briefing Desk:** FinFlow lets SME merchants register a callback URL for payment status updates, and FinFlow's servers call that URL. If the check is loose, a merchant can point FinFlow at internal infrastructure instead, and FinFlow's own network makes the request for them.

## Bug Report

The validator checks whether the URL *contains* an allowlisted host. It never parses the URL to find out which host would actually be called.

## Your Task

Edit `solution.js` and implement:

```js
export function validateCallbackUrl(input, allowedHosts)
```

Rules:

- Parse the input as a URL. Malformed input is rejected without throwing.
- Only `https:` is allowed.
- Reject URLs that carry a username or password.
- Only the default HTTPS port (443) is allowed.
- The parsed hostname must exactly match an entry in `allowedHosts`. Ignore case.
- Return `{ allowed: boolean, reason?: string }`.

## Threat

**The Red Team:** Metadata Detour hides the cloud metadata address behind a URL that *looks* like an allowlisted host.

## Win Condition

Behavior tests and the Red Team pass when only exact, secure, allowlisted callback hosts are accepted.

## Field Notes

This is server-side request forgery (SSRF). String checks on URLs fail because the real destination depends on how a URL parser reads the whole string.
