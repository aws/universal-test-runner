#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src'

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <framework> [args]')
  .command('jest', 'Run jest tests')
  .command('junit', 'Run junit tests')
  .version()
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .demandCommand(1, 1)
  .strict(true)
  .parseSync()

run(String(argv._[0]), {
  testsToRun: process.env.TESTS_TO_RUN?.split('|') ?? [],
})
