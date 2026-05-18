# Debrief: Limit Loop

## What changed

The rule now checks the projected daily spend before writing state and leaves declined transactions out of the stored total.

## Why it matters

Declined activity should not poison future approvals or create reconciliation drift.

## Production habit

Only commit state after a decision is approved.

