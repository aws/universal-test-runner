#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// The license header can't be top of the file since we need the shebang there,
// so the eslint rule is a false positive in this file. Disable it for now.
/* eslint-disable header/header */

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src/run'
import _readProtocol, { ProtocolResult } from '../src/readProtocol'
import { loadAdapter as _loadAdapter } from '../src/loadAdapter'
import log from '../src/log'
import ProtocolLogger from '../src/ProtocolLogger'
import { ErrorCodes } from './ErrorCodes'
import { Adapter } from '@sentinel-internal/universal-test-runner-types'

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

const protocolLogger = new ProtocolLogger()

;(async () => {
  const protocolResult = await readProtocol()
  await validateProtocolVersion(protocolResult.version)
  const adapter = await loadAdapter(String(adapterPath))
  await runTests(adapter, protocolResult)
})()

async function readProtocol(): Promise<ProtocolResult> {
  try {
    protocolLogger.logProtocolReadStart()
    const [protocolResult, rawValues] = _readProtocol(process.env)
    protocolLogger.setLogFileName(protocolResult.logFileName)
    protocolLogger.logProtocolReadEnd()
    protocolLogger.logDiscoveredProtocolEnvVars(rawValues)
    protocolLogger.logProtocolVersion(protocolResult.version)
    return protocolResult
  } catch (e) {
    await cleanUp(e)
    process.exit(ErrorCodes.PROTOCOL_ERROR)
  }
}

async function validateProtocolVersion(version: string): Promise<void> {
  const SUPPORTED_VERSIONS = ['0.1.0']

  if (!SUPPORTED_VERSIONS.includes(version)) {
    await cleanUp(new Error(`Protocol version ${version} is not supported by this runner`))
    process.exit(ErrorCodes.PROTOCOL_VERSION_NOT_SUPPORTED)
  }

  log.info('Use Test Execution Protocol version', version)
}

async function loadAdapter(adapterPath: string): Promise<Adapter> {
  try {
    protocolLogger.logAdapterPath(adapterPath)
    protocolLogger.logAdapterLoadStart()
    const adapter = await _loadAdapter(adapterPath, process.cwd())
    protocolLogger.logAdapterLoadEnd()
    return adapter
  } catch (e) {
    await cleanUp(e)
    process.exit(ErrorCodes.ADAPTER_LOADING_ERROR)
  }
}

async function runTests(adapter: Adapter, protocolResult: ProtocolResult): Promise<void> {
  try {
    protocolLogger.logTestRunStart()
    const { exitCode } = await run(adapter, protocolResult)
    protocolLogger.logTestRunEnd()
    await cleanUp()
    process.exit(exitCode ?? ErrorCodes.ADAPTER_EXIT_CODE_ERROR)
  } catch (e) {
    await cleanUp(e)
    process.exit(ErrorCodes.RUNNER_ERROR)
  }
}

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
