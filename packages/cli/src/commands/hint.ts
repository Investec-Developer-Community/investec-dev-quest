import type { Command } from 'commander'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { p, pc } from '../ui/theme.js'
import { renderMarkdown } from '../ui/markdown.js'
import { EXIT_CODES } from '@investec-game/shared'
import { findLevelDir, loadLevel, type ResolvedLevel } from '../levels/loader.js'
import { getProgress, recordHintUnlock, getUnlockedHints } from '../db/progress.js'
import { resolveLevelSelection } from './levelSelection.js'
import { runAttack, runTests } from '../runner/testRunner.js'
import { ensureApiRunning } from '../services/apiProcess.js'
import { renderStuckLadder } from '../runner/feedback.js'
import { summarizeFailureMessage } from '../runner/failureSummary.js'
import { hintBonusFor } from '../services/certificate.js'
import { extractTestSource } from '../services/walkthrough.js'
import { nextStepFor } from './explain.js'

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
  replay: ['replay', 'replays', 'freshness', 'timestamp', 'timestamps', 'delivery-id'],
  ssrf: ['ssrf', 'callback', 'callbacks', 'url', 'url-validation'],
  'audit-log': ['audit', 'audit-log', 'hash-chain', 'tamper-evidence', 'ledger'],
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
    { topic: 'replay', pattern: /(replay|stale|fresh|timestamp|delivery id)/ },
    { topic: 'ssrf', pattern: /(ssrf|callback|userinfo|metadata|hostname|allowlisted host)/ },
    { topic: 'audit-log', pattern: /(audit|hash chain|brokenat|prevhash|ledger|tamper)/ },
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

function detectTopicsInText(text: string): string[] {
  const topics: string[] = []
  for (const topic of Object.keys(TOPIC_ALIASES)) {
    if (topicInText(text, topic)) {
      topics.push(topic)
    }
  }
  return topics
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

function renderHintBonusChange(before: number, after: number): void {
  const was = hintBonusFor(before)
  const now = hintBonusFor(after)
  if (was !== now) {
    p.log.message(pc.dim(`Hint bonus for this level: +${now} XP (was +${was}).`))
  }
}

async function runWalkthrough(resolved: ResolvedLevel, hintsTotal: number, unlocked: number[]): Promise<void> {
  const { manifest, solutionPath, testsDir, attackDir } = resolved

  if (unlocked.length < hintsTotal) {
    p.log.warn(pc.yellow(`The walkthrough unlocks after the ${hintsTotal} written hints (${unlocked.length}/${hintsTotal} unlocked).`))
    p.log.message(pc.dim('Run `pnpm game hint` to unlock the next one.'))
    return
  }

  if (!existsSync(solutionPath)) {
    p.cancel(pc.red(`No solution.js found. Run: pnpm game level ${manifest.level} --season ${manifest.season}`))
    process.exit(EXIT_CODES.USAGE_ERROR)
  }

  if (manifest.apiRequired) {
    try {
      await ensureApiRunning()
    } catch (err) {
      p.cancel(pc.red(err instanceof Error ? err.message : 'Failed to start mock API'))
      process.exit(EXIT_CODES.USAGE_ERROR)
    }
  }

  const spinner = p.spinner()
  spinner.start('Finding your first failing assertion…')
  const behavior = await runTests(testsDir, manifest.id)
  const attack = await runAttack(attackDir, manifest.id)
  spinner.stop('Analysis complete')

  const runnerError = behavior.error ?? attack.error
  if (runnerError) {
    p.note(pc.red(`Runner error:\n${runnerError}`), pc.red('Walkthrough unavailable'))
    p.log.message(pc.dim('Fix the runner error first. The walkthrough was not charged.'))
    return
  }

  const behaviorFailure = behavior.tests.find((test) => test.status === 'fail')
  const attackFailure = attack.tests.find((test) => test.status === 'fail')
  const failure = behaviorFailure ?? attackFailure
  if (!failure) {
    p.log.success(pc.green('Nothing is failing. Run `pnpm game test` to record the win. The walkthrough was not charged.'))
    return
  }

  const isAttack = !behaviorFailure
  const walkthroughIndex = hintsTotal
  const firstUnlock = !unlocked.includes(walkthroughIndex)
  if (firstUnlock) {
    recordHintUnlock(manifest.id, walkthroughIndex)
  }

  const summary = failure.message ? summarizeFailureMessage(failure.message) : 'Assertion failed'
  const detail = failure.message
    ? failure.message
        .split('\n')
        .filter((line) => line.trim().length > 0 && !/^\s*(at\s|❯|\(?file:\/\/)/.test(line))
        .slice(0, 6)
        .join('\n')
    : summary
  const source = extractTestSource(isAttack ? [attackDir] : [testsDir], failure.name)
  const suiteLabel = isAttack
    ? `Red Team${manifest.attackName ? `: ${manifest.attackName}` : ''}`
    : 'Behavior tests'

  const lines = [
    pc.bold('Suite: ') + suiteLabel,
    pc.bold('Failing test: ') + failure.name,
    '',
    pc.bold('What the test saw:'),
    pc.red(detail),
    '',
    pc.bold('Intent: ') + nextStepFor(failure.name, summary, isAttack),
  ]

  if (source) {
    lines.push('')
    lines.push(pc.bold(`Assertion source (${isAttack ? 'attack' : 'tests'}/${source.file}):`))
    lines.push(pc.dim(source.source))
  }

  lines.push('')
  lines.push(pc.cyan('Make only this assertion pass, then run `pnpm game test` again.'))

  p.note(lines.join('\n'), pc.yellow(`Walkthrough (hint ${hintsTotal + 1})`))

  if (firstUnlock) {
    renderHintBonusChange(unlocked.length, unlocked.length + 1)
    p.log.message(pc.dim('Re-run `pnpm game hint --walkthrough` any time for the current first failure at no extra cost.'))
  }
}

export function registerHintCommand(program: Command): void {
  program
    .command('hint')
    .description('Reveal the next hint for the active level')
    .option('-s, --season <n>', 'Season number')
    .option('-l, --level <n>', 'Level number')
    .option('--all', 'Show all previously unlocked hints')
    .option('--topic <name>', 'Focus hint output on a topic (for example: auth, pagination, mcc)')
    .option('--walkthrough', 'After the written hints: pinpoint the first failing assertion and its intent (counts as a hint)')
    .action(async (opts: { season?: string; level?: string; all?: boolean; topic?: string; walkthrough?: boolean }) => {
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

      if (opts.walkthrough) {
        await runWalkthrough(resolved, hintFiles.length, unlocked)
        return
      }

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
        renderStuckLadder({
          manifest,
          hintsUnlocked: hintFiles.length,
          hintsTotal: hintFiles.length,
          walkthroughUnlocked: unlocked.includes(hintFiles.length),
          intro: `All ${hintFiles.length} written hints are unlocked (review them with \`pnpm game hint --all\`).`,
        })
        return
      }

      const file = hintFiles[nextIndex]
      if (!file) return

      const nextContent = readFileSync(join(hintsDir, file), 'utf-8')

      if (requestedTopic && !topicInText(nextContent, requestedTopic)) {
        let previewIndex: number | null = null
        for (let idx = nextIndex + 1; idx < hintFiles.length; idx += 1) {
          const previewFile = hintFiles[idx]
          if (!previewFile) continue
          const previewContent = readFileSync(join(hintsDir, previewFile), 'utf-8')
          if (topicInText(previewContent, requestedTopic)) {
            previewIndex = idx
            break
          }
        }

        const nextTopics = detectTopicsInText(nextContent)
        if (nextTopics.length > 0) {
          p.log.message(
            pc.dim(`Next unlockable hint appears focused on: ${formatTopics(nextTopics)}.`)
          )
        }

        if (previewIndex !== null) {
          const previewFile = hintFiles[previewIndex]
          if (!previewFile) return
          const previewContent = readFileSync(join(hintsDir, previewFile), 'utf-8')
          p.log.message(
            pc.dim(`Showing topic preview for hint ${previewIndex + 1}; unlock order is unchanged.`)
          )
          p.note(
            renderMarkdown(previewContent),
            `Topic preview: Hint ${previewIndex + 1} of ${hintFiles.length} (focus: ${requestedTopic})`
          )
          p.log.message(pc.dim('Run `pnpm game hint` to unlock the next sequential hint.'))
          return
        }

        p.log.message(pc.dim(`No hint currently matches topic "${requestedTopic}" for this level.`))
        p.log.message(pc.dim('Run `pnpm game hint` to continue sequential unlocks.'))
        return
      }

      recordHintUnlock(manifest.id, nextIndex)

      const title = requestedTopic
        ? `Hint ${nextIndex + 1} of ${hintFiles.length} (focus: ${requestedTopic})`
        : `Hint ${nextIndex + 1} of ${hintFiles.length}`
      p.note(renderMarkdown(nextContent), title)
      renderHintBonusChange(unlocked.length, unlocked.length + 1)

      const remaining = hintFiles.length - nextIndex - 1
      if (remaining > 0) {
        p.log.message(pc.dim(`${remaining} more hint(s) available.`))
      } else {
        p.log.message(pc.dim('That was the last written hint. Still stuck? `pnpm game explain` is free, then `pnpm game hint --walkthrough`.'))
      }

      // Ensure progress row exists
      const progress = getProgress(manifest.id)
      if (!progress) {
        p.log.message(pc.dim(`Run \`pnpm game level ${level} --season ${season}\` first.`))
      }
    })
}
