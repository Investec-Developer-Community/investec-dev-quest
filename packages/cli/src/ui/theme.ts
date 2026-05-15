/**
 * Shared terminal UI theme — ASCII banner, color helpers, intro/outro wrappers.
 * Uses @clack/prompts + picocolors + raw ANSI for the gradient.
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { CLI_VERSION } from '../version.js'
import { loadAllLevels } from '../levels/loader.js'

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

function getMissionLabel(): string {
  try {
    const count = loadAllLevels().length
    return `${count} mission${count === 1 ? '' : 's'}`
  } catch {
    return 'missions unavailable'
  }
}

export function showBanner(): void {
  const missionLabel = getMissionLabel()

  console.log()
  for (let i = 0; i < LOGO_LINES.length; i++) {
    console.log(`  ${GRAYS[i]}${LOGO_LINES[i]}${RESET}`)
  }
  console.log()
  p.intro(
    pc.bgCyan(pc.black(' Investec Dev Community ')) +
      pc.dim(` · local sim · ${missionLabel} · v${CLI_VERSION}`)
  )
}

export function showOutro(message: string): void {
  p.outro(message)
}

// ── Convenience wrappers for consistent styling ─────────────────────

export { p, pc }
