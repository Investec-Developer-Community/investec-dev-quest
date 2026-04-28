# Debrief: Merchant Mirage

## What changed

The fixed implementation normalises the merchant category code before comparing it with the blocked MCC list.

## Why it matters

Programmable Banking card events arrive from a platform boundary. Values that look numeric may arrive as strings, and security decisions become fragile when code assumes the wrong type.

## Production habit

Normalise external input at the boundary, then make authorization decisions against a single trusted representation.