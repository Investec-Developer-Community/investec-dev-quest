# Debrief: Budget Guardian

## What changed

The rule now checks the projected fast-food spend before approval and records spend only through the post-transaction hook.

## Why it matters

Budget controls depend on both timing and category scope. Updating the wrong thing at the wrong time makes limits porous.

## Production habit

Separate pre-authorization decisions from post-approval accounting.

## Try it for real

- On a real programmable card, `beforeTransaction` has about 2 seconds to decide, and `afterTransaction` gets about 15 seconds for bookkeeping. That's the same split you just enforced. See the [card IDE FAQ](https://developer.investec.com/individuals).
- Store budget limits in the IDE's `env.json` instead of hardcoding them. See the [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code).

