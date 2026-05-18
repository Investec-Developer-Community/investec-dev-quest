import type { Command } from 'commander'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { p, pc } from '../ui/theme.js'
import { renderMarkdown } from '../ui/markdown.js'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel } from '../levels/loader.js'
import { getProgress, recordHintUnlock, getUnlockedHints } from '../db/progress.js'
import { resolveLevelSelection } from './levelSelection.js'
import { runAttack, runTests } from '../runner/testRunner.js'
import { ensureApiRunning } from '../services/apiProcess.js'

const TOPIC_ALIASES: Record<string, string[]> = {
  auth: ['auth', 'authentication', 'oauth', 'oauth2', 'token', 'credentials'],
  pagination: ['pagination', 'cursor', 'page', 'pages'],
  beneficiaries: ['beneficiary', 'beneficiaries', 'payee', 'payees'],
  idempotency: ['idempotency', 'idempotent', 'retry-key'],
  mcc: ['mcc', 'merchant', 'category', 'coercion', 'type-coercion'],
  state: ['state', 'stateful', 'approve-then-write', 'declined', 'budget'],
  allowlist: ['allowlist', 'allow-list', 'trusted', 'prefix', 'tool-permissions'],
  sanitization: ['sanitize', 'sanitization', 'injection', 'prompt-injection', 'redaction'],
  citations: ['citation', 'citations', 'source', 'sources', 'hallucination'],
  'loop-safety': ['loop', 'loops', 'infinite-loops', 'runaway'],
  webhooks: ['webhook', 'webhooks', 'hmac', 'signature', 'timing-safe-compare'],
}

function normalizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function canonicalTopic(topic: string): string {
  const normalized = normalizeTopic(topic)
  if (normalized.length === 0) return normalized

  for (const [canonical, aliases] of Object.entries(TOPIC_ALIASES)) {
    if (canonical === normalized || aliases.some((alias) => normalizeTopic(alias) === normalized)) {
      return canonical
    }
  }

  return normalized
}

function extractFailureTopics(text: string): string[] {
  const input = text.toLowerCase()
  const found = new Set<string>()
  const topicPatterns: Array<{ topic: string; pattern: RegExp }> = [
    { topic: 'auth', pattern: /(auth|token|oauth|credential)/ },
    { topic: 'pagination', pattern: /(cursor|pagination|page)/ },
    { topic: 'beneficiaries', pattern: /(beneficiar|payee)/ },
    { topic: 'idempotency', pattern: /(idempot|retry key)/ },
    { topic: 'mcc', pattern: /(mcc|merchant|category|coerc)/ },
    { topic: 'state', pattern: /(state|declined|approve-then-write|daily_spend)/ },
    { topic: 'allowlist', pattern: /(allowlist|allow-list|tool|trusted|prefix|registry)/ },
    { topic: 'sanitization', pattern: /(sanitize|sanitiz|prompt|inject|redact)/ },
    { topic: 'citations', pattern: /(citation|claim|source|hallucination)/ },
    { topic: 'loop-safety', pattern: /(loop|consecutive|repeat|runaway)/ },
    { topic: 'webhooks', pattern: /(webhook|hmac|signature|timing-safe)/ },
  ]

  for (const rule of topicPatterns) {
    if (rule.pattern.test(input)) {
      found.add(rule.topic)
    }
  }

  return [...found]
}

function topicInText(text: string, topic: string): boolean {
  const canonical = canonicalTopic(topic)
  const aliases = TOPIC_ALIASES[canonical] ?? [canonical]
  const source = text.toLowerCase()

  return aliases.some((alias) => {
    const hyphen = alias.toLowerCase()
    const spaced = hyphen.replace(/-/g, ' ')
    return source.includes(hyphen) || source.includes(spaced)
  })
}

function formatTopics(topics: string[]): string {
  return topics.map((topic) => topic.replace(/-/g, ' ')).join(', ')
}

async function inferFailureTopics(
  opts: { requiresApi: boolean; solutionPath: string; testsDir: string; attackDir: string }
): Promise<string[]> {
  if (!existsSync(opts.solutionPath)) {
    return []
  }

  if (opts.requiresApi) {
    try {
      await ensureApiRunning()
    } catch {
      return []
    }
  }

  const behavior = await runTests(opts.testsDir, 'hint-topic-scan')
  const attack = await runAttack(opts.attackDir, 'hint-topic-scan')
  const failures = [
    ...behavior.tests.filter((test) => test.status === 'fail'),
    ...attack.tests.filter((test) => test.status === 'fail'),
  ]

  const topics = new Set<string>()
  for (const failure of failures) {
    for (const topic of extractFailureTopics(`${failure.name} ${failure.message ?? ''}`)) {
      topics.add(topic)
    }
  }

  return [...topics]
}

export function registerHintCommand(program: Command): void {
  program
    .command('hint')
    .description('Reveal the next hint for the active level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('--all', 'Show all previously unlocked hints')
    .option('--topic <name>', 'Focus hint output on a topic (for example: auth, pagination, mcc)')
    .action(async (opts: { season?: string; level?: string; all?: boolean; topic?: string }) => {
      const { season, level } = resolveLevelSelection(program, opts)

      const levelDir = findLevelDir(season, level)
      if (!levelDir) {
        p.cancel(pc.red(`Level S${season}L${level} not found.`))
        process.exit(EXIT_CODES.USAGE_ERROR)
      }

      const resolved = loadLevel(levelDir)
      const { manifest, hintsDir } = resolved

      if (!existsSync(hintsDir)) {
        p.log.warn(pc.yellow('No hints available for this level.'))
        return
      }

      const hintFiles = readdirSync(hintsDir)
        .filter((f) => f.endsWith('.md'))
        .sort()

      if (hintFiles.length === 0) {
        p.log.warn(pc.yellow('No hints available for this level.'))
        return
      }

      const unlocked = getUnlockedHints(manifest.id)

      const requestedTopic = opts.topic ? canonicalTopic(opts.topic) : null
      const manifestTopics = manifest.tags.map((tag) => canonicalTopic(tag))
      const failureTopics = requestedTopic
        ? await inferFailureTopics({
            requiresApi: manifest.apiRequired,
            solutionPath: resolved.solutionPath,
            testsDir: resolved.testsDir,
            attackDir: resolved.attackDir,
          })
        : []
      const availableTopics = [...new Set([...manifestTopics, ...failureTopics])]

      if (requestedTopic && !availableTopics.includes(requestedTopic) && availableTopics.length > 0) {
        p.log.warn(pc.yellow(`Topic "${requestedTopic}" was not detected for this level.`))
        p.log.message(pc.dim(`Try one of: ${formatTopics(availableTopics)}`))
      }

      if (opts.all) {
        let indexes = unlocked
        if (requestedTopic) {
          indexes = indexes.filter((idx) => {
            const file = hintFiles[idx]
            if (!file) return false
            const content = readFileSync(join(hintsDir, file), 'utf-8')
            return topicInText(content, requestedTopic)
          })
        }

        if (indexes.length === 0) {
          if (requestedTopic && unlocked.length > 0) {
            p.log.message(pc.dim(`No unlocked hints matched topic "${requestedTopic}" yet.`))
          } else {
            p.log.message(pc.dim('No hints unlocked yet. Run `pnpm game hint` to unlock the first one.'))
          }
          return
        }

        for (const idx of indexes) {
          const file = hintFiles[idx]
          if (file) {
            p.note(renderMarkdown(readFileSync(join(hintsDir, file), 'utf-8')), `Hint ${idx + 1}`)
          }
        }
        return
      }

      const nextIndex = unlocked.length

      if (nextIndex >= hintFiles.length) {
        p.log.warn(pc.yellow(`You've already unlocked all ${hintFiles.length} hint(s) for this level.`))
        p.log.message(pc.dim('Run with --all to review them.'))
        return
      }

      const file = hintFiles[nextIndex]
      if (!file) return

      const nextContent = readFileSync(join(hintsDir, file), 'utf-8')

      if (requestedTopic && !topicInText(nextContent, requestedTopic)) {
        p.log.message(
          pc.dim(`No exact "${requestedTopic}" match in the next unlockable hint; showing next hint to preserve unlock order.`)
        )
      }

      recordHintUnlock(manifest.id, nextIndex)

      const title = requestedTopic
        ? `Hint ${nextIndex + 1} of ${hintFiles.length} (focus: ${requestedTopic})`
        : `Hint ${nextIndex + 1} of ${hintFiles.length}`
      p.note(renderMarkdown(nextContent), title)

      const remaining = hintFiles.length - nextIndex - 1
      if (remaining > 0) {
        p.log.message(pc.dim(`${remaining} more hint(s) available.`))
      }

      // Ensure progress row exists
      const progress = getProgress(manifest.id)
      if (!progress) {
        p.log.message(pc.dim(`Run \`pnpm game level ${level} --season ${season}\` first.`))
      }
    })
}
