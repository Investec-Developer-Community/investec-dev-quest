# Debrief: Transaction Trail

## What changed

The client sends the date range to the API and follows cursor pagination until all matching transactions are collected.

## Why it matters

Compliance reports must be complete and scoped. Missing pages or extra months can both break trust.

## Production habit

Push filters to the source system and prove you consumed the full result set.

