import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const MAX_SNIPPET_LINES = 30

function quotedVariants(title: string): string[] {
  return [`'${title}'`, `"${title}"`, `\`${title}\``]
}

/**
 * Best-effort extraction of the `it(...)`/`test(...)` block whose title matches.
 * Brace counting ignores strings/comments, so the snippet is capped for safety.
 */
export function extractTestSource(dirs: string[], title: string): { file: string; source: string } | null {
  const variants = quotedVariants(title)

  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    const files = readdirSync(dir).filter((name) => /\.(test|spec)\.[cm]?[jt]s$/.test(name)).sort()

    for (const file of files) {
      const lines = readFileSync(join(dir, file), 'utf-8').split('\n')
      const start = lines.findIndex((line) => variants.some((variant) => line.includes(variant)))
      if (start < 0) continue

      const snippet: string[] = []
      let depth = 0
      let opened = false
      for (let i = start; i < lines.length && snippet.length < MAX_SNIPPET_LINES; i += 1) {
        const line = lines[i] ?? ''
        snippet.push(line)
        for (const char of line) {
          if (char === '{') {
            depth += 1
            opened = true
          } else if (char === '}') {
            depth -= 1
          }
        }
        if (opened && depth <= 0) break
      }

      return { file, source: snippet.join('\n') }
    }
  }

  return null
}
