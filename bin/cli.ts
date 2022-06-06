#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src'

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <adapter> [args]')
  .version()
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .demandCommand(1, 1)
  .strict(true)
  .parseSync()

const [adapter] = argv._

const { CAWS_TEST_NAMES_TO_RUN = '' } = process.env

run(String(adapter), {
  testNamesToRun: CAWS_TEST_NAMES_TO_RUN.split('|'),
})
