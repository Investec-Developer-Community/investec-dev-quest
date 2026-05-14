# Season Boss: Rule Reactor

## Mission Brief

FinFlow is rolling out a consolidated card-rule engine. Instead of separate checks, one policy pass now decides whether each transaction is approved.

The team needs this ruleset hardened before production traffic is switched over.

## Bug Report

Fraud simulation found multiple bypasses:

- blocked MCCs passed when type handling was loose
- lowercase country codes slipped through allowlist assumptions
- rapid-fire spend bursts were not throttled correctly
- declined over-limit transactions still mutated state

You need to stabilize both decision logic and state updates.

## Your Task

Edit `solution.js` to implement:

```js
export function beforeTransaction(event, kv)
export function afterTransaction(event, kv)
```

### Rules to enforce

1. Decline restricted MCCs (`5816`, `7995`) with defensive type handling.
2. Allow countries `ZA` and `NA` only, case-insensitive.
3. Enforce velocity: max 3 approved attempts in 60 seconds; decline the 4th.
4. Enforce daily spend limit: R2,000.
5. Enforce monthly fast-food limit (MCC `5812`): R500.
6. Only mutate spend state on approved transactions.
7. `afterTransaction` must only update fast-food spend for MCC `5812`.

State keys used in `kv`:

- `velocity_timestamps`
- `daily_spend`
- `fastfood_spend`

## Threat

The attack script sends a blocked MCC as a string, simulates over-limit declines, and attempts to poison state so later transactions are wrongly rejected.

If your checks and state boundaries are not strict, the exploit path stays open.

## Win Condition

Both test suites must pass:

- behavior tests confirm the policy works for valid and invalid scenarios
- attack tests confirm bypasses and state-poisoning attempts are blocked
