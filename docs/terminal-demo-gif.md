# Terminal Demo GIF Guide

Use this guide to record short terminal-only clips for the game.

## What to Capture

Keep clips short (5-12 seconds each) and focus on the best moments:

1. Start level: `pnpm game level 1 --season 1`
2. Run tests: `pnpm game test`
3. Show progress/completion: `pnpm game status`

## Recommended Tooling (asciinema + agg)

This gives cleaner output than normal screen recording.

### 1. Install tools

```bash
brew install asciinema agg
```

### 2. Record terminal session

```bash
asciinema rec docs/media/raw/gameplay.cast
```

Run your commands, then press `Ctrl+D` to stop recording.

### 3. Convert to GIF

```bash
agg --fps-cap 12 --font-size 18 --speed 1.1 docs/media/raw/gameplay.cast docs/media/gameplay-demo.gif
```

## Optional: Native macOS Recording

If you prefer native recording:

1. Press `Cmd+Shift+5`
2. Choose `Record Selected Portion`
3. Select terminal window only
4. Trim in QuickTime
5. Convert to GIF (optional)

Example conversion with ffmpeg:

```bash
ffmpeg -i docs/media/raw/gameplay.mov -vf "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 docs/media/gameplay-demo.gif
```

## Embed in README

```markdown
![Terminal gameplay demo](docs/media/gameplay-demo.gif)
```

## Practical Tips

1. Increase terminal font size before recording.
2. Use a clean prompt and empty terminal before starting.
3. Avoid printing secrets or raw `.env` values.
4. Keep GIF width around 900-1000px for smaller files.
