#!/usr/bin/env node
import { config as loadEnv } from 'dotenv'
import { join } from 'path'
import { program } from 'commander'
import { REPO_ROOT } from './paths.js'
import { runPreflightChecks } from './preflight.js'
import { registerLevelCommand } from './commands/level.js'
import { registerTestCommand } from './commands/test.js'
import { registerHintCommand } from './commands/hint.js'
import { registerResetCommand } from './commands/reset.js'
import { registerStatusCommand } from './commands/status.js'
import { registerWatchCommand } from './commands/watch.js'
import { registerReferenceCommand } from './commands/reference.js'
import { registerJournalCommand } from './commands/journal.js'
import { registerExplainCommand } from './commands/explain.js'
import { CLI_VERSION } from './version.js'

loadEnv({ path: join(REPO_ROOT, '.env') })

runPreflightChecks()

program
  .name('investec-game')
  .description('A local-first developer game for the Investec developer community')
  .version(CLI_VERSION)
  .showHelpAfterError('(run with --help for usage examples)')

registerLevelCommand(program)
registerTestCommand(program)
registerHintCommand(program)
registerResetCommand(program)
registerStatusCommand(program)
registerWatchCommand(program)
registerReferenceCommand(program)
registerJournalCommand(program)
registerExplainCommand(program)

await program.parseAsync()
