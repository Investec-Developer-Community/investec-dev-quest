# Debrief: Transaction Trail

## What changed

The client sends the date range to the API and follows cursor pagination until all matching transactions are collected.

## Why it matters

Compliance reports must be complete and scoped. Missing pages or extra months can both break trust.

## Production habit

Push filters to the source system and prove you consumed the full result set.

## Try it for real

- The [Private Bank API](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information) transactions endpoint supports date filters. Try them in the [sandbox](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox).
- Two real-world tips from the [developer FAQ](https://developer.investec.com/individuals): `transactionDate` is when the card was swiped and `postingDate` is when the balance changed, and a transaction with `postedOrder` 0 hasn't settled yet.

