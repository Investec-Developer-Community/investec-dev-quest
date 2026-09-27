# Debrief: Merchant Mirage

## What changed

The card rule now normalizes the incoming merchant category code before comparing it with the blocked list.

## Why it matters

Card events cross a platform boundary. A value that looks numeric may arrive as a string, and authorization decisions fail when types drift.

## Production habit

Normalize external input at the boundary, then decide against one trusted representation.

## Try it for real

- Real card code runs in the Investec Online card IDE. There, `beforeTransaction(authorization)` returns `true` to approve or `false` to decline, and amounts arrive in cents. See the [card IDE guide](https://developer.investec.com/individuals) and the [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code).
- Use the IDE's transaction simulator to test a merchant-category rule before deploying it to your card.

