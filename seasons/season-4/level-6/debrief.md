# Debrief: Loop Detector

## What changed

Loop detection now counts consecutive calls by tool name even when parameters change.

## Why it matters

Runaway agents often vary inputs while repeating the same failed action.

## Production habit

Detect repeated intent, not just identical payloads.

## Try it for real

- An agent stuck in a loop against real banking APIs burns tokens, rate limits, and trust. Add loop detection before connecting an assistant to the [Private Bank API](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information).
- Share your agent builds with the [Investec Developer Community](https://developer.investec.com/community).

