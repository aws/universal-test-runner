#!/usr/bin/env node

// CODE.AWS Test Runner and Test Adapters
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

// The license header can't be top of the file since we need the shebang there,
// so the eslint rule is a false positive in this file. Disable it for now.
/* eslint-disable header/header */

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src/run'
import readProtocol from '../src/readProtocol'
import { loadAdapter } from '../src/loadAdapter'
import log from '../src/log'
import { ErrorCodes } from '../src/ErrorCodes'

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <adapter> [args]')
  .version()
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .demandCommand(1, 1)
  .strict(true)
  .parseSync()

const [adapterPath] = argv._

;(async () => {
  let protocolResult

  try {
    protocolResult = readProtocol(process.env)
  } catch (e) {
    log.error(e)
    process.exit(ErrorCodes.PROTOCOL_ERROR)
  }

  try {
    const adapter = await loadAdapter(String(adapterPath), process.cwd())
    await run(adapter, protocolResult, process)
  } catch (e) {
    log.error(e)
    process.exit(ErrorCodes.RUNNER_ERROR)
  }
})()
