# Debrief: Rule Reactor

## What changed

The boss rule now combines strict MCC handling, country allowlists, velocity control, spend limits, and safe state timing.

## Why it matters

Combined policy engines fail when one guard mutates state before another guard declines.

## Production habit

Order policy checks so rejection paths stay side-effect free.

