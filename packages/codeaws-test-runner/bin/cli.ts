#!/usr/bin/env node

// CODE.AWS Test Runner and Test Adapters
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

/* eslint-disable header/header */

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src/run'
import discover from '../src/protocol'
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

const discoveryResult = discover(process.env)

loadAdapter(String(adapterPath), process).then((adapter) => {
  return run(adapter, discoveryResult, process)
})
