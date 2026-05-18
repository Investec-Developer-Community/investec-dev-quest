# Season Boss: Rule Reactor

## Mission Brief

**The Briefing Desk:** Season 2 ends inside a consolidated card-rule engine. One policy pass must handle merchant category restrictions, country controls, velocity, daily spend, and fast-food budget discipline.

## Bug Report

Fraud simulation found multiple bypasses: loose MCC handling, lowercase country surprises, missing throttles, and state writes from declined transactions.

## Your Task

Edit `solution.js` and implement:

```js
export function beforeTransaction(event, kv)
export function afterTransaction(event, kv)
```

Rules:

1. Decline MCCs `5816` and `7995` with defensive type handling.
2. Allow only ZA and NA, case-insensitive.
3. Enforce max 3 approved attempts in 60 seconds.
4. Enforce a R2,000 daily limit.
5. Enforce a R500 monthly fast-food limit for MCC `5812`.
6. Only mutate spend state on approved transactions.
7. `afterTransaction` updates fast-food spend only for MCC `5812`.

## Threat

**The Red Team:** Rule Reactor Breach combines type bypasses, over-limit attempts, and state poisoning.

## Win Condition

Behavior tests and the Red Team pass when the full ruleset is strict without rejecting legitimate local transactions.
