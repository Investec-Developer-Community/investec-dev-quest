import { readFileSync } from 'fs'
import { join } from 'path'
import { REPO_ROOT } from './paths.js'

const FALLBACK_VERSION = '0.0.0'

function readCliVersion(): string {
  try {
    const raw = readFileSync(join(REPO_ROOT, 'packages', 'cli', 'package.json'), 'utf-8')
    const parsed = JSON.parse(raw) as { version?: unknown }
    if (typeof parsed.version === 'string' && parsed.version.length > 0) {
      return parsed.version
    }
  } catch {
    // Fallback keeps CLI usable even if package metadata is unavailable.
  }

  return FALLBACK_VERSION
}

export const CLI_VERSION = readCliVersion()