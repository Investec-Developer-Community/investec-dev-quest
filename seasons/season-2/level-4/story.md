# Country Control

## Mission Brief

A FinFlow business client runs a South African company with operations in Namibia. Their corporate cards must **only work in South Africa (ZA) and Namibia (NA)**. International transactions should be blocked — the company doesn't travel and any foreign transaction is likely fraud.

## Bug Report

The security team tested the shipped rule and found that UK transactions (`"GB"`) are being **approved**. The allowlist exists, but the decision logic does not yet deny countries outside it.

## Your Task

Fix `beforeTransaction` so it:

1. Normalises the country code before checking (uppercase or lowercase — pick one and be consistent)
2. Approves transactions from ZA and NA
3. Declines all other countries with an appropriate message

```js
export function beforeTransaction(event)
```

The `event.merchant.country.code` field is a 2-letter ISO 3166-1 alpha-2 code (e.g. `"ZA"`, `"NA"`, `"GB"`, `"US"`).

## Threat

The attack fires a transaction from a non-allowed country and also checks that valid local countries are still approved.

## Win Condition

Both test suites must pass.

The attack fires a transaction from `"GB"` and confirms `"ZA"` is still approved after the fix.
