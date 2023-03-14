#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// The license header can't be top of the file since we need the shebang there,
// so the eslint rule is a false positive in this file. Disable it for now.
/* eslint-disable header/header */

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { run } from '../src/run'
import { readProtocol as _readProtocol } from '../src/readProtocol'
import { loadAdapter as _loadAdapter, builtInAdapters } from '../src/loadAdapter'
import { log } from '../src/log'
import { ProtocolLogger } from '../src/ProtocolLogger'
import { ErrorCodes, UniversalTestRunnerError } from './ErrorCodes'
import { Adapter, ProtocolResult } from '@aws/universal-test-runner-types'

const argv = yargs(hideBin(process.argv))
  .command(
    '$0 <adapter|packageName|adapterPath>',
    'Run tests according to the Test Execution Protocol',
    (yargs) => {
      yargs
        .positional('adapter', {
          describe: `The name of a built-in adapter (${Object.keys(builtInAdapters)})`,
          type: 'string',
        })
        .example('$0 jest', 'Run tests with a built-in adapter')
        .positional('packageName', {
          describe: 'The package name of a third-party adapter',
          type: 'string',
        })
        .example('$0 my-adapter-from-npm', 'Run tests with a third-party adapter')
        .positional('adapterPath', {
          describe: 'The file path to a custom adapter',
          type: 'string',
        })
        .example('$0 ./my-adapter.js', 'Run tests with a custom adapter')
    },
  )
  .demandCommand(1, 1)
  .version()
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .strict(true)
  .parseSync()

const protocolLogger = new ProtocolLogger()

void (async () => {
  try {
    const protocolResult = readProtocol()
    validateProtocolVersion(protocolResult.version)
    const adapter = await loadAdapter(String(argv.adapterPath))
    const exitCode = await runTests(adapter, protocolResult)
    await cleanUp()
    process.exit(exitCode)
  } catch (e: any) {
    await cleanUp(e)
    process.exit(e.code)
  }
})()

async function cleanUp(error?: any) {
  if (error) {
    log.error(error)
    protocolLogger.logError(String(error))
  }
  try {
    await protocolLogger.write()
  } catch (e) {
    log.warn('Unable to write logs to', protocolLogger.getLogFileName(), e)
  }
}

function readProtocol(): ProtocolResult {
  try {
    protocolLogger.logProtocolReadStart()
    const [protocolResult, rawValues] = _readProtocol(process.env)
    protocolLogger.setLogFileName(protocolResult.logFileName)
    protocolLogger.logProtocolReadEnd()
    protocolLogger.logDiscoveredProtocolEnvVars(rawValues)
    protocolLogger.logProtocolVersion(protocolResult.version)
    return protocolResult
  } catch (e: any) {
    e.code = ErrorCodes.PROTOCOL_ERROR
    throw e
  }
}

function validateProtocolVersion(version: string) {
  const SUPPORTED_VERSIONS = ['0.1.0']

  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new UniversalTestRunnerError(
      `Protocol version ${version} is not supported by this runner`,
      ErrorCodes.PROTOCOL_VERSION_NOT_SUPPORTED,
    )
  }

  log.info('Using Test Execution Protocol version', version)
}

async function loadAdapter(adapterPath: string): Promise<Adapter> {
  try {
    protocolLogger.logAdapterPath(adapterPath)
    protocolLogger.logAdapterLoadStart()
    const adapter = await _loadAdapter(adapterPath, process.cwd())
    protocolLogger.logAdapterLoadEnd()
    return adapter
  } catch (e: any) {
    e.code = ErrorCodes.ADAPTER_LOADING_ERROR
    throw e
  }
}

async function runTests(adapter: Adapter, protocolResult: ProtocolResult): Promise<number> {
  try {
    protocolLogger.logTestRunStart()
    const { exitCode } = await run(adapter, protocolResult)
    protocolLogger.logTestRunEnd()
    return exitCode ?? ErrorCodes.ADAPTER_EXIT_CODE_ERROR
  } catch (e: any) {
    e.code = ErrorCodes.RUNNER_ERROR
    throw e
  }
}
