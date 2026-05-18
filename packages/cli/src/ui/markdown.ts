/**
 * Lightweight terminal markdown renderer.
 *
 * Handles the subset used by game story files:
 * - H1, H2, H3 headings
 * - **bold**
 * - `inline code`
 * - Fenced code blocks (```lang)
 * - Unordered lists (- item)
 * - Ordered lists (1. item)
 * - Blockquotes (> text)
 * - Paragraphs
 */
import pc from 'picocolors'

interface RenderMarkdownOptions {
  compact?: boolean
}

export function renderMarkdown(source: string, options: RenderMarkdownOptions = {}): string {
  if (options.compact) {
    source = compactStoryMarkdown(source)
  }

  const lines = source.split('\n')
  const output: string[] = []
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    // Fenced code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        output.push(pc.dim('  ┌─'))
        continue
      } else {
        inCodeBlock = false
        output.push(pc.dim('  └─'))
        continue
      }
    }

    if (inCodeBlock) {
      output.push(pc.dim('  │ ') + pc.cyan(line))
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      output.push('')
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      output.push(pc.bold(line.slice(4)))
      continue
    }
    if (line.startsWith('## ')) {
      output.push('')
      output.push(pc.bold(pc.cyan(line.slice(3))))
      output.push(pc.dim('─'.repeat(Math.min(line.slice(3).length, 50))))
      continue
    }
    if (line.startsWith('# ')) {
      // H1 skipped — p.note() title shows level name
      continue
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      const content = applyInline(line.slice(2))
      output.push(pc.dim('  │ ') + pc.yellow(content))
      continue
    }

    // Unordered list
    if (/^- /.test(line)) {
      const content = applyInline(line.slice(2))
      output.push(`  ${pc.dim('•')} ${content}`)
      continue
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (olMatch) {
      const content = applyInline(olMatch[2]!)
      output.push(`  ${pc.dim(olMatch[1] + '.')} ${content}`)
      continue
    }

    // Paragraph text
    output.push(applyInline(line))
  }

  return output.join('\n')
}

function compactStoryMarkdown(source: string): string {
  const preferredSections = ['Mission Brief', 'Your Task', 'Win Condition']
  const lines = source.split('\n')

  const sections = new Map<string, string[]>()
  let currentSection: string | null = null

  for (const line of lines) {
    const match = line.match(/^##\s+(.*)$/)
    if (match) {
      currentSection = match[1]?.trim() ?? null
      if (currentSection && !sections.has(currentSection)) {
        sections.set(currentSection, [])
      }
      continue
    }

    if (currentSection && sections.has(currentSection)) {
      sections.get(currentSection)?.push(line)
    }
  }

  const picked: string[] = []
  for (const sectionName of preferredSections) {
    const sectionLines = sections.get(sectionName)
    if (!sectionLines) continue
    picked.push(`## ${sectionName}`)
    picked.push(...sectionLines)
    picked.push('')
  }

  if (picked.length > 0) {
    return picked.join('\n').trim()
  }

  const fallbackLines = lines.filter((line) => line.trim().length > 0).slice(0, 24)
  return fallbackLines.join('\n')
}

function applyInline(text: string): string {
  // Inline code: `...`
  text = text.replace(/`([^`]+)`/g, (_match, code: string) => pc.cyan(code))
  // Bold: **...**
  text = text.replace(/\*\*([^*]+)\*\*/g, (_match, bold: string) => pc.bold(bold))
  return text
}
