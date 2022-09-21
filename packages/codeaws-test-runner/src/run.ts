// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'
import { Adapter, AdapterInput, AdapterOutput } from '@sentinel-internal/codeaws-test-runner-types'
import { ProtocolResult } from './readProtocol'
import { ErrorCodes } from '../bin/ErrorCodes'

function mapProtocolResultToAdapterInput(protocolResult: ProtocolResult): AdapterInput {
  return {
    testsToRun: protocolResult.testsToRun,
    testReportFormat: protocolResult.testReportFormat,
    testReportOutputDir: protocolResult.testReportOutputDir,
    testReportFileName: protocolResult.testReportFileName,
  }
}

async function run(adapter: Adapter, protocolResult: ProtocolResult): Promise<AdapterOutput> {
  const adapterInput = mapProtocolResultToAdapterInput(protocolResult)
  try {
    log.info('Calling executeTests on adapter...')
    const adapterOutput = await adapter.executeTests(adapterInput)
    log.info('Finished executing tests.')
    return adapterOutput
  } catch (e) {
    log.error('Failed to run tests.', e)
    return { exitCode: ErrorCodes.ADAPTER_ERROR }
  }
}

export default run
