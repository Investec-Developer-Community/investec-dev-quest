# Debrief: Description Sanitizer

## What changed

Transaction summaries now mark instruction-like merchant descriptions as unsafe while preserving normal descriptions.

## Why it matters

External text can carry instructions that target downstream AI systems.

## Production habit

Treat customer and merchant text as data, never as authority.

