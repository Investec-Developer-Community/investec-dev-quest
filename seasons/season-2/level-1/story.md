# Level 1: Merchant Mirage

## Mission Brief

**The Briefing Desk:** Welcome to Card Code. FinFlow cards are supposed to decline gambling transactions before authorization. A tester has found that some restricted merchant category codes still pass.

This is the fastest Quickstart mission: one event, one card rule, one boundary assumption to inspect.

## Bug Report

The blocklist contains MCC `5816` and `7995`, but the incoming card event does not always use the same JavaScript type as the local list.

## Your Task

Edit `solution.js`. Fix:

```js
export function beforeTransaction(event)
```

Rules:

- Do not change the blocked MCC list.
- Read `event.merchant.category.code`.
- Decline blocked MCCs.
- Approve allowed merchants.

## Threat

**The Red Team:** MCC Mirage sends a blocked gambling MCC in the shape used by card event payloads.

## Win Condition

Behavior tests and the Red Team pass when blocked MCCs are declined and legitimate merchants still go through.

## Field Notes

Investec Programmable Banking card code runs before authorization and returns `{ approved: true }` or `{ approved: false }`.
