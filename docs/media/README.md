# README Hero GIF

The 14-second, looping [gameplay demo](gameplay-demo.gif) keeps the real DEV QUEST
logo and all 23 missions visible in a two-column campaign overview. A compact
feedback area moves through the offline Merchant Mirage mission: investigate,
repair, then a clean solve with the Red Team blocked.

The logo is captured from `pnpm game status`, mission names come from the manifests,
and the recorder verifies the feedback against real CLI runs. The layout and edit
scene are staged for readability. The GIF includes the induction mission's
solution as a deliberate preview of the learning loop.

## Regenerate

From the repository root, after `pnpm install` and `pnpm --filter @investec-game/shared build`:

```bash
brew install agg
node docs/media/record-hero.mjs
agg --font-family Menlo --font-size 18 --line-height 1.25 --theme github-dark --fps-cap 12 --last-frame-duration 5 docs/media/gameplay-demo.cast docs/media/gameplay-demo.gif
```

The recorder uses a temporary checkout and home directory, the public example
configuration, and the installed dependencies. It asserts that the starter is
exploitable and that the repaired version passes and blocks the attack. It does
not change your solutions, progress, or local `.env`, and removes the temporary
workspace afterward. The intermediate asciicast is gitignored; commit only the
updated GIF when regenerating it.

The four scenes hold for 3, 3, 3, and 5 seconds. The terminal is 100 columns and
34 rows, with assertions guarding against wrapping and scrolling. Every scene
uses CRLF line endings so each terminal line starts at the left margin, and the
cursor is hidden. Menlo keeps the block logo and monospace columns aligned on
macOS; use an installed monospace font with box-drawing support on other systems.
