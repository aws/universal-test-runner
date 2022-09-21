// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'
import { Adapter, AdapterInput } from '@sentinel-internal/codeaws-test-runner-types'
import { ProtocolResult } from './readProtocol'
import { ErrorCodes } from './ErrorCodes'

type Process = Pick<typeof process, 'exit'>

function mapProtocolResultToAdapterInput(protocolResult: ProtocolResult): AdapterInput {
  return {
    testsToRun: protocolResult.testsToRun,
    testReportFormat: protocolResult.testReportFormat,
    testReportOutputDir: protocolResult.testReportOutputDir,
    testReportFileName: protocolResult.testReportFileName,
  }
}

async function run(adapter: Adapter, protocolResult: ProtocolResult, processObject: Process) {
  const adapterInput = mapProtocolResultToAdapterInput(protocolResult)
  try {
    log.info('Calling executeTests on adapter...')
    const { exitCode } = await adapter.executeTests(adapterInput)
    log.info('Finished executing tests.')
    processObject.exit(exitCode ?? ErrorCodes.ADAPTER_RETURNED_NO_EXIT_CODE)
  } catch (e) {
    log.error('Failed to run tests.', e)
    processObject.exit(ErrorCodes.ADAPTER_ERROR)
  }
}

export default run
