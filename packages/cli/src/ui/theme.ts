/**
 * Shared terminal UI theme — ASCII banner, color helpers, intro/outro wrappers.
 * Uses @clack/prompts + picocolors + raw ANSI for the gradient.
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'

// ── ASCII art banner ────────────────────────────────────────────────
// Hand-crafted Unicode block characters for "DEV QUEST"

const LOGO_LINES = [
  '██████╗ ███████╗██╗   ██╗     ██████╗ ██╗   ██╗███████╗███████╗████████╗',
  '██╔══██╗██╔════╝██║   ██║    ██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝',
  '██║  ██║█████╗  ██║   ██║    ██║   ██║██║   ██║█████╗  ███████╗   ██║   ',
  '██║  ██║██╔══╝  ╚██╗ ██╔╝    ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   ',
  '██████╔╝███████╗ ╚████╔╝     ╚██████╔╝╚██████╔╝███████╗███████║   ██║   ',
  '╚═════╝ ╚══════╝  ╚═══╝       ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ',
]

// Top-to-bottom gray gradient using ANSI 256-color codes
const GRAYS = [
  '\x1b[38;5;252m',
  '\x1b[38;5;249m',
  '\x1b[38;5;246m',
  '\x1b[38;5;243m',
  '\x1b[38;5;240m',
  '\x1b[38;5;237m',
]

const RESET = '\x1b[0m'

export function showBanner(): void {
  console.log()
  for (let i = 0; i < LOGO_LINES.length; i++) {
    console.log(`  ${GRAYS[i]}${LOGO_LINES[i]}${RESET}`)
  }
  console.log()
  p.intro(pc.bgCyan(pc.black(' Investec Dev Quest ')))
}

export function showOutro(message: string): void {
  p.outro(message)
}

// ── Convenience wrappers for consistent styling ─────────────────────

export { p, pc }
