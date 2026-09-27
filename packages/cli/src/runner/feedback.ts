import { p, pc } from '../ui/theme.js'
import type { CaseFileEntry, LevelManifest, TestRunResult } from '@investec-game/shared'
import { summarizeFailureMessage } from './failureSummary.js'
import { calculateLevelXpBreakdown } from '../services/certificate.js'
import type { Milestone } from '../services/milestones.js'
import type { LastRunSummary } from '../db/progress.js'
import { REPO_URL, buildLinkedInShareUrl, buildStuckDiscussionUrl, buildXShareUrl } from '../services/community.js'
import { buildNextForPath } from '../services/realWorld.js'
import type { SocialMoment } from '../services/social.js'

interface RenderOptions {
  verbose?: boolean
  attackName?: string
}

export function renderTestResults(
  results: TestRunResult,
  label = 'Tests',
  options: RenderOptions = {}
): void {
  const verbose = options.verbose === true

  if (results.error) {
    p.log.error(pc.red(`${label} — Error`))
    p.note(pc.red(`Runner error:\n${results.error}`), pc.red(label))
    return
  }

  const lines: string[] = []
  for (const test of results.tests) {
    if (test.status === 'pass') {
      lines.push(`${pc.green('✓')} ${pc.dim(test.name)}`)
    } else if (test.status === 'skip') {
      lines.push(`${pc.yellow('⊘')} ${pc.dim(test.name)} (skipped)`)
    } else {
      lines.push(`${pc.red('✗')} ${test.name}`)
      if (test.message) {
        if (verbose) {
          const trimmed = test.message.split('\n').slice(0, 12).join('\n')
          lines.push(pc.red(`  ${trimmed.replace(/\n/g, '\n  ')}`))
        } else {
          lines.push(pc.red(`  Why: ${summarizeFailureMessage(test.message)}`))
        }
      }
    }
  }

  const summary = results.passed
    ? pc.green(pc.bold(`${results.total}/${results.total} passed`))
    : pc.red(pc.bold(`${results.failed}/${results.total} failed`))

  lines.push('')
  lines.push(summary)
  if (!results.passed && !verbose) {
    lines.push(pc.dim('Tip: run with --verbose to see full failure traces.'))
  }

  const title = results.passed ? pc.green(label) : pc.red(label)
  p.note(lines.join('\n'), title)
}

interface NextMissionInfo {
  command: string
  name: string
  pathName: string
  complete: number
  total: number
}

interface WinBannerOptions {
  attempts?: number
  hintsUsed?: number
  referenceCommand?: string
  /** `null` means every mission is complete; `undefined` omits the section. */
  nextMission?: NextMissionInfo | null
  boss?: boolean
  caseFile?: CaseFileEntry
}

export function renderWinBanner(levelName: string, options: WinBannerOptions = {}): void {
  const attempts = options.attempts ?? 0
  const hintsUsed = options.hintsUsed ?? 0
  const rank = hintsUsed === 0 && attempts <= 2
    ? 'Clean Solve'
    : hintsUsed <= 2
      ? 'Field Repair'
      : 'Incident Resolved'
  const xp = calculateLevelXpBreakdown({ attempts, hintsUsed, boss: options.boss })
  const xpParts = [
    `base ${xp.base}`,
    `hints +${xp.hintBonus}`,
    `attempts +${xp.attemptBonus}`,
    ...(xp.bossBonus > 0 ? [`boss +${xp.bossBonus}`] : []),
  ]
  const lines = [
    pc.yellow(pc.bold('🎉  Level Complete!')),
    '',
    `"${levelName}" is solved.`,
    '',
    pc.cyan(`Rank: ${rank}`),
    pc.cyan(`XP earned: +${xp.total}`) + pc.dim(` (${xpParts.join(' · ')})`),
    pc.dim('Both behavior tests and the attack script pass.'),
    pc.dim(`Attempts: ${attempts}  Hints used: ${hintsUsed}`),
    pc.dim('Run `pnpm game status` to see your progress.'),
  ]

  if (options.referenceCommand) {
    lines.push(pc.cyan(`Review reference: ${options.referenceCommand}`))
  }

  if (options.caseFile) {
    lines.push('')
    lines.push(pc.yellow(pc.bold('Case file recorded')))
    lines.push(pc.dim(`Adversary blocked: ${options.caseFile.adversaryBlocked}`))
    lines.push(pc.dim(`Production habit: ${options.caseFile.productionHabit}`))
    lines.push(pc.dim(`Downstream consequence: ${options.caseFile.downstreamConsequence}`))
  }

  if (options.nextMission) {
    const next = options.nextMission
    lines.push('')
    lines.push(pc.cyan(pc.bold(`Next mission: ${next.name}`)))
    lines.push(pc.dim(`${next.pathName}: ${next.complete}/${next.total} complete`))
    lines.push(pc.cyan(`Run: ${next.command}`))
  } else if (options.nextMission === null) {
    lines.push('')
    lines.push(pc.green(pc.bold('Every mission is complete.')))
    lines.push(pc.cyan('Run `pnpm game certificate` to claim your completion.'))
  }

  p.note(lines.join('\n'), pc.yellow('Level Complete'))
}

export function renderMilestones(milestones: Milestone[]): void {
  if (milestones.length === 0) return

  const lines: string[] = []
  for (const milestone of milestones) {
    lines.push(pc.magenta(pc.bold(milestone.headline)))
    lines.push(pc.dim(milestone.detail))
    lines.push('')
  }
  lines.push(pc.cyan('Run `pnpm game badge` to see your badges and share text.'))

  p.note(lines.join('\n'), pc.magenta('Milestone Unlocked'))

  for (const milestone of milestones) {
    if (milestone.kind !== 'path' || !milestone.badgeId) continue
    renderBuildNext(milestone.badgeId.replace(/^path:/, ''))
  }
}

export function renderBuildNext(pathId: string): void {
  const suggestion = buildNextForPath(pathId)
  if (!suggestion) return

  p.note(pc.bold(suggestion.idea), pc.green('What to build next (real Investec APIs)'))
  for (const link of suggestion.links) {
    console.log(`   ${link.label}: ${link.url}`)
  }
}

export function renderSocialPrompt(moment: SocialMoment): void {
  p.note(
    [
      pc.yellow(pc.bold(moment.headline)),
      '',
      moment.shareText,
      '',
      pc.dim('If Dev Quest helped you, a GitHub star helps other developers find it.'),
      pc.dim('Turn these prompts off with GAME_QUIET_SOCIAL=1 in .env or --quiet-social.'),
    ].join('\n'),
    pc.yellow('Share the Win')
  )
  console.log(`   Star the repo: ${REPO_URL}`)
  console.log(`   Post on X:     ${buildXShareUrl(moment.shareText)}`)
  console.log(`   LinkedIn:      ${buildLinkedInShareUrl()}`)
}

export function renderProgressDelta(previous: LastRunSummary, current: LastRunSummary): void {
  const arrow = (before: number, after: number) =>
    after > before ? pc.green('▲') : after < before ? pc.red('▼') : pc.dim('=')
  const behavior = `Behavior ${previous.behaviorPassed}/${previous.behaviorTotal} → ${current.behaviorPassed}/${current.behaviorTotal} ${arrow(previous.behaviorPassed, current.behaviorPassed)}`
  const attack = `Red Team ${previous.attackPassed}/${previous.attackTotal} → ${current.attackPassed}/${current.attackTotal} ${arrow(previous.attackPassed, current.attackPassed)}`

  const before = previous.behaviorPassed + previous.attackPassed
  const after = current.behaviorPassed + current.attackPassed
  const verdict = after > before
    ? pc.green('Closer than last run. Keep that change and move to the next failing test.')
    : after < before
      ? pc.yellow('Something that passed last run now fails. Check what your last edit touched.')
      : pc.dim('No change since last run. `pnpm game explain` can point at the next step.')

  p.log.message(`${pc.bold('Progress:')} ${behavior}   ${attack}\n${verdict}`)
}

interface StuckLadderOptions {
  manifest: LevelManifest
  hintsUnlocked: number
  hintsTotal: number
  walkthroughUnlocked: boolean
  intro?: string
}

export function renderStuckLadder(options: StuckLadderOptions): void {
  const { manifest, hintsUnlocked, hintsTotal, walkthroughUnlocked } = options
  const writtenHintsDone = hintsUnlocked >= hintsTotal
  const lines: string[] = []

  if (options.intro) {
    lines.push(options.intro)
    lines.push('')
  }

  let step = 1
  if (!writtenHintsDone) {
    lines.push(`${step++}. ${pc.cyan('pnpm game hint')}  written hints (${hintsUnlocked}/${hintsTotal} unlocked)`)
  }
  lines.push(`${step++}. ${pc.cyan('pnpm game explain')}  free, non-spoiler coaching for every failing test`)
  if (walkthroughUnlocked) {
    lines.push(`${step++}. ${pc.cyan('pnpm game hint --walkthrough')}  unlocked, re-run any time for the current first failure`)
  } else if (writtenHintsDone) {
    lines.push(`${step++}. ${pc.cyan('pnpm game hint --walkthrough')}  pinpoints the first failing assertion and its intent (counts as a hint)`)
  } else {
    lines.push(`${step++}. ${pc.dim('pnpm game hint --walkthrough')}  ${pc.dim('unlocks after the written hints')}`)
  }
  lines.push(`${step++}. Ask the Response Cell community (link below). Share your approach and failing test, not a full solution.`)

  p.note(lines.join('\n'), pc.cyan('Stuck-Escape Ladder'))
  console.log(`   ${buildStuckDiscussionUrl(manifest)}`)
}

export function renderAttackResult(
  results: TestRunResult,
  exploitBlocked: boolean,
  options: RenderOptions = {}
): void {
  const verbose = options.verbose === true
  const attackName = options.attackName
  const attackLabel = attackName ? `Red Team: ${attackName}` : 'Attack Script'
  const lines: string[] = []

  if (results.error) {
    lines.push(pc.red(`Runner error:\n${results.error}`))
  } else {
    for (const test of results.tests) {
      if (test.status === 'pass') {
        lines.push(`${pc.green('✓')} ${pc.dim(test.name)}`)
      } else {
        lines.push(`${pc.red('✗')} ${test.name}`)
        if (test.message) {
          if (verbose) {
            const trimmed = test.message.split('\n').slice(0, 10).join('\n')
            lines.push(pc.red(`  ${trimmed.replace(/\n/g, '\n  ')}`))
          } else {
            lines.push(pc.red(`  Why: ${summarizeFailureMessage(test.message)}`))
          }
        }
      }
    }
  }

  lines.push('')

  if (exploitBlocked) {
    lines.push(pc.green(pc.bold(attackName ? `${attackName} blocked ✓` : 'Exploit blocked ✓')))
  } else {
    lines.push(pc.red(pc.bold(attackName ? `${attackName} still succeeds — vulnerability not yet fixed` : 'Exploit succeeds — vulnerability not yet fixed')))
    if (!verbose) {
      lines.push(pc.dim('Tip: run with --verbose to see full attack trace output.'))
    }
  }

  const title = exploitBlocked ? pc.green(attackLabel) : pc.red(attackLabel)
  p.note(lines.join('\n'), title)
}

interface BeginnerGuidanceOptions {
  includeJournal?: boolean
}

export function renderBeginnerGuidance(options: BeginnerGuidanceOptions = {}): void {
  const includeJournal = options.includeJournal === true
  const actionSteps = [
    '1. Start with the first failing test above.',
    '2. Use `pnpm game hint` for a nudge.',
    '3. Make one small change, then run `pnpm game test` again.',
  ]

  if (includeJournal) {
    actionSteps.push('4. Run `pnpm game journal` to see recorded choices, evidence, and downstream consequences.')
    actionSteps.push('5. Run `pnpm game explain` for non-spoiler next-step coaching from failing tests.')
  } else {
    actionSteps.push('4. Run `pnpm game explain` for non-spoiler next-step coaching from failing tests.')
  }

  const lines = [
    pc.cyan(pc.bold('What to do next')),
    '',
    ...actionSteps,
    '',
    pc.dim('Tip: behavior tests protect the feature; the attack script protects the fix.'),
    pc.dim('You can run `pnpm game status` anytime to track progress.'),
  ]

  p.note(lines.join('\n'), pc.cyan('Guidance'))
}
