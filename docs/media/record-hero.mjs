import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripVTControlCharacters as stripAnsi } from 'node:util'

const mediaDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(mediaDir, '../..')
const workspace = mkdtempSync(join(tmpdir(), 'dev-quest-hero-'))
const home = join(workspace, 'home')
const checkout = join(workspace, 'repo')

function game(args) {
  const result = spawnSync('pnpm', ['--silent', 'game', ...args], {
    cwd: checkout,
    env: { ...process.env, HOME: home, FORCE_COLOR: '1', CI: '1', GAME_QUIET_SOCIAL: '1' },
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return result.stdout.replace(/\r/g, '')
}

try {
  mkdirSync(home)
  mkdirSync(join(checkout, 'packages/cli'), { recursive: true })
  cpSync(join(repoRoot, '.env.example'), join(checkout, '.env'))
  for (const path of ['package.json', 'pnpm-workspace.yaml', 'scripts', 'packages/cli/src', 'packages/cli/package.json', 'seasons']) {
    cpSync(join(repoRoot, path), join(checkout, path), {
      recursive: true,
      filter: (source) => !/level-\d+\/solution\.js$/.test(source),
    })
  }
  for (const path of ['node_modules', 'packages/cli/node_modules', 'packages/shared']) {
    symlinkSync(join(repoRoot, path), join(checkout, path), 'dir')
  }

  const start = game([])
  assert.match(stripAnsi(start), /Merchant Mirage/)
  const status = game(['status'])
  const failing = game(['test'])
  assert.match(stripAnsi(failing), /MCC Mirage still succeeds/i)
  assert.match(stripAnsi(failing), /3\/8 failed/)
  const solutionPath = join(checkout, 'seasons/season-2/level-1/solution.js')
  const starter = readFileSync(solutionPath, 'utf8')
  assert.ok(starter.includes('const mcc = event?.merchant?.category?.code'))
  writeFileSync(solutionPath, starter.replace(
    'const mcc = event?.merchant?.category?.code',
    'const mcc = Number(event?.merchant?.category?.code)'
  ))
  const passing = game(['test'])
  assert.match(stripAnsi(passing), /MCC Mirage blocked/i)
  assert.match(stripAnsi(passing), /Level Complete/)
  assert.match(stripAnsi(passing), /8\/8 passed/)

  const color = (code, text) => `\x1b[${code}m${text}\x1b[0m`
  const muted = (text) => color('38;5;245', text)
  const cyan = (text) => color('1;36', text)
  const green = (text) => color('1;32', text)
  const red = (text) => color('1;31', text)
  const logo = stripAnsi(status).split('\n').filter((line) => line.trim()).slice(0, 6)
  assert.ok(logo.every((line) => /[\u2588\u255a]/.test(line)), 'Expected the real six-line DEV QUEST logo')
  const manifests = readdirSync(join(checkout, 'seasons')).flatMap((season) =>
    readdirSync(join(checkout, 'seasons', season)).map((level) =>
      JSON.parse(readFileSync(join(checkout, 'seasons', season, level, 'manifest.json'), 'utf8'))
    )
  ).sort((first, second) => first.season - second.season || first.level - second.level)
  assert.equal(manifests.length, 23)
  const seasonNames = ['API FOUNDATIONS', 'CARD CODE & RULES ENGINE', 'SECURE FINTECH WORKFLOWS', 'INTELLIGENT BANKING AUTOMATION']
  const columns = 100
  const rows = 34
  const pair = (left, right) => '  ' + left + ' '.repeat(48 - [...stripAnsi(left)].length) + right

  function campaign(state) {
    const completed = state === 'win'
    const sections = seasonNames.map((name, index) => {
      const levels = manifests.filter((manifest) => manifest.season === index + 1)
      return [
        cyan(`0${index + 1}  ${name}`),
        ...levels.map((manifest) => {
          const active = manifest.id === 's2-l1'
          const name = `L${manifest.level} ${manifest.name.replace(/^Season Boss: /, '')}`
          const label = active ? (completed ? green(name) : color('1;37', name)) : color('37', name)
          const marker = active ? (completed ? green('\u25cf') : color('33', '\u25d0')) : muted('\u25cb')
          return `${marker} ${label}${manifest.boss ? color('35', ' [boss]') : ''}`
        }),
      ]
    })
    const lines = []
    for (const [leftIndex, rightIndex] of [[0, 1], [2, 3]]) {
      for (let index = 0; index < 7; index++) {
        lines.push(pair(sections[leftIndex][index] ?? '', sections[rightIndex][index] ?? ''))
      }
      lines.push('')
    }
    return lines
  }

  function frame(state, footer) {
    const lines = [
      '',
      ...logo.map((line, index) => '            ' + color(`38;5;${252 - index * 2}`, line.trimEnd().trimStart())),
      '',
      '  ' + color('46;30', ' Investec Dev Community ') + muted(`  /  LOCAL SIM  /  ${manifests.length} MISSIONS  /  v${JSON.parse(readFileSync(join(checkout, 'package.json'), 'utf8')).version}`),
      '',
      ...campaign(state),
      '  ' + muted('\u2500'.repeat(94)),
      ...footer.map((line) => '  ' + line),
    ]
    assert.ok(lines.length < rows, `Frame has ${lines.length} lines; terminal has ${rows}`)
    for (const line of lines) {
      assert.ok([...stripAnsi(line)].length < columns, `Frame would wrap: ${stripAnsi(line)}`)
    }
    return lines.join('\r\n')
  }

  const scenes = [
    [0, frame('start', [cyan('YOUR FIRST MISSION  /  MERCHANT MIRAGE'), '', green('$') + ' pnpm game', muted('S2 L1  /  Beginner  /  Offline  /  ~10 min')])],
    [3, frame('fail', [cyan('01  /  INVESTIGATE'), '', green('$') + ' pnpm game test', red('Behavior: 3/8 failed') + '    ' + red('Red Team: MCC Mirage still succeeds')])],
    [6, frame('fix', [cyan('02  /  REPAIR THE CARD RULE'), '', red('- const mcc = event?.merchant?.category?.code'), green('+ const mcc = Number(event?.merchant?.category?.code)')])],
    [9, frame('win', [green('03  /  LEVEL COMPLETE'), '', green('Behavior: 8/8 passed') + '    ' + green('Red Team: MCC Mirage blocked'), cyan('+175 XP') + muted('  /  Clean Solve  /  1 of 23 complete  /  Next: First Contact')])],
  ]
  const cast = [
    JSON.stringify({ version: 2, width: columns, height: rows, title: 'DEV QUEST: 23 missions. One clean solve.' }),
    ...scenes.map(([time, text]) => JSON.stringify([time, 'o', '\x1b[?25l\x1b[2J\x1b[H' + text])),
  ].join('\n') + '\n'
  writeFileSync(join(mediaDir, 'gameplay-demo.cast'), cast)
  console.log('Recorded real CLI feedback: starter exploit succeeds; one-line repair passes behavior and blocks the Red Team.')
  console.log('Saved docs/media/gameplay-demo.cast (4 aligned scenes; 9 seconds plus final-frame hold).')
} finally {
  rmSync(workspace, { recursive: true, force: true })
}