# Debrief: Callback Trap

## What changed

The validator now parses the callback with a real URL parser. It requires `https:`, rejects embedded credentials and non-default ports, and compares the parsed hostname exactly (ignoring case) against the allowlist.

## Why it matters

SSRF turns your own servers into the attacker's proxy. Cloud metadata endpoints, admin panels, and internal services trust traffic from inside the network. A string check on a URL can be fooled by userinfo, look-alike domains, or paths.

## Production habit

Validate the parsed destination, not the raw string. In production, also resolve DNS and block private or link-local IP ranges at connect time, and send outbound callbacks through an egress proxy with its own allowlist.

## Try it for real

- Investec API calls go to fixed, documented hosts. Pin your clients to them instead of accepting configurable URLs. See the [Private Bank API reference](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information) and its [sandbox details](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox).
- Card code can call external APIs from `afterTransaction`. Keep those destinations in a fixed allowlist too. See the [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code).
