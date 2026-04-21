# Country Control

## The situation

A FinFlow business client runs a South African company with operations in Namibia. Their corporate cards must **only work in South Africa (ZA) and Namibia (NA)**. International transactions should be blocked — the company doesn't travel and any foreign transaction is likely fraud.

You implement the geo-restriction rule. The code review looks fine, it ships — but the security team tests it and finds that UK transactions (`"GB"`) are being **approved**.

You look at the code and spot the bug:

```js
const ALLOWED_COUNTRIES = ['ZA', 'NA']

export function beforeTransaction(event) {
  const code = event.merchant.country.code.toUpperCase()

  if (ALLOWED_COUNTRIES.includes(code)) {
    return { approved: true }  // ZA and NA are approved
  }

  // BUG: Falls through here for any other country — still approved!
  return { approved: true }
}
```

The developer wrote the allow path but forgot to write the **decline** path. Every country not in the allowlist falls through to the same `{ approved: true }` default.

## Your task

Fix `beforeTransaction` so it:

1. Normalises the country code before checking (uppercase or lowercase — pick one and be consistent)
2. Approves transactions from ZA and NA
3. Declines all other countries with an appropriate message

```js
export function beforeTransaction(event)
```

The `event.merchant.country.code` field is a 2-letter ISO 3166-1 alpha-2 code (e.g. `"ZA"`, `"NA"`, `"GB"`, `"US"`).

## Win condition

Both test suites must pass.

The attack fires a transaction from `"GB"`. The starter approves it due to the case mismatch; the reference declines it. A second attack confirms `"ZA"` is still approved after the fix.
