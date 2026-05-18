# Debrief: Loop Detector

## What changed

Loop detection now counts consecutive calls by tool name even when parameters change.

## Why it matters

Runaway agents often vary inputs while repeating the same failed action.

## Production habit

Detect repeated intent, not just identical payloads.
