# Debrief: Limit Loop

## What changed

The rule now checks the projected daily spend before writing state and leaves declined transactions out of the stored total.

## Why it matters

Declined activity should not poison future approvals or create reconciliation drift.

## Production habit

Only commit state after a decision is approved.

## Try it for real

- On real cards, `afterTransaction` runs only for processed transactions and `afterDecline` handles declines, so the platform itself separates the paths. Put spend tracking in the right hook. See the [card IDE guide](https://developer.investec.com/individuals).
- See [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code) for managing card code programmatically.

