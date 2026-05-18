# Debrief: Merchant Mirage

## What changed

The card rule now normalizes the incoming merchant category code before comparing it with the blocked list.

## Why it matters

Card events cross a platform boundary. A value that looks numeric may arrive as a string, and authorization decisions fail when types drift.

## Production habit

Normalize external input at the boundary, then decide against one trusted representation.

