# Budget Guardian

## Mission Brief

A parent has set up a Programmable Banking card for their teenager. They want a hard spending limit: **no more than R500 per month at fast-food restaurants** (MCC 5812 — Eating Places & Restaurants).

You've been asked to implement the card rule. The first version was shipped in a hurry and only has a placeholder: it approves every transaction regardless of category or accumulated spend.

## Bug Report

A quick test confirms the bug: 6 × R100 fast-food transactions all go through. The sixth should have been declined.

## Your Task

Implement two functions that work together:

```js
// Called AFTER a transaction is approved and posted
// Use this to update the running spend total
export function afterTransaction(event, kv)

// Called BEFORE a transaction — approve or decline
export function beforeTransaction(event, kv)
```

The `kv` parameter is a simple key-value store (an object with `get(key)` and `set(key, value)` methods). Use it to persist the running spend total between calls.

### Rules

- Track spend **only for MCC 5812** transactions
- The monthly budget is **R500**
- The event's `centsAmount` is in **cents** — convert to rands (÷ 100) before comparing
- In `beforeTransaction`: if `runningSpend + thisTransactionAmount > 500`, return `{ approved: false, message: '...' }`
- In `afterTransaction`: if the transaction is MCC 5812, **add** `centsAmount / 100` to the running total
- Other MCCs should always be approved

### The kv store

```js
kv.get('fastfood_spend')         // returns number or undefined
kv.set('fastfood_spend', 350.0)  // stores a value
```

Start the running total at `0` if `kv.get('fastfood_spend')` returns `undefined`.

## Threat

The attack simulates repeated fast-food approvals and expects the rule to stop the transaction that would exceed the monthly cap.

## Win Condition

Both test suites must pass.

The attack simulates 6 × R100 fast-food transactions in sequence. The 6th transaction must be **declined**.
