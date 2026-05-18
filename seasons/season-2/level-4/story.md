# Country Control

## Mission Brief

**The Briefing Desk:** A South African SME with Namibia operations wants cards to work only in ZA and NA. A simulated UK transaction is still being approved.

## Bug Report

The allowlist exists, but the decision path does not default-deny countries outside it.

## Your Task

Edit `solution.js` and implement:

```js
export function beforeTransaction(event)
```

Rules:

- Read `event.merchant.country.code`.
- Normalize the country code consistently.
- Approve ZA and NA.
- Decline every other country with a message.

## Threat

**The Red Team:** Border Bypass fires a non-allowed country and checks that local transactions still work.

## Win Condition

Behavior tests and the Red Team pass when GB is declined and ZA remains approved.
