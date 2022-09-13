#!/usr/bin/env node

// CODE.AWS Test Runner and Test Adapters
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

// The license header can't be top of the file since we need the shebang there,
// so the eslint rule is a false positive in this file. Disable it for now.
/* eslint-disable header/header */

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src/run'
import readProtocol from '../src/protocol'
import { loadAdapter } from '../src/adapter'

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

const protocolResult = readProtocol(process.env)

loadAdapter(String(adapterPath), process).then((adapter) => {
  return run(adapter, protocolResult, process)
})
