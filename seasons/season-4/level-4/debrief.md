# Debrief: Description Sanitizer

## What changed

Transaction summaries now mark instruction-like merchant descriptions as unsafe while preserving normal descriptions.

## Why it matters

External text can carry instructions that target downstream AI systems.

## Production habit

Treat customer and merchant text as data, never as authority.

## Try it for real

- Transaction descriptions from the [Private Bank API](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information) are merchant-controlled text. Sanitise them before they reach any model prompt. Try it with [sandbox](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox) data.

