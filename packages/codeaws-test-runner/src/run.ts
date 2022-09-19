// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'
import { Adapter, AdapterInput } from '@sentinel-internal/codeaws-test-runner-types'
import { ProtocolResult } from './protocol'

type Process = Pick<typeof process, 'exit'>

function mapProtocolResultToAdapterInput(protocolResult: ProtocolResult): AdapterInput {
  return {
    testsToRun: protocolResult.testsToRun,
    testReportFormat: protocolResult.testReportFormat,
    testReportOutputDir: protocolResult.testReportOutputDir,
    testReportFileName: protocolResult.testReportFileName,
  }
}

export const ErrorCodes = {
  /*
   * Adapter threw an unrecoverable error when executing tests. NOT to be used
   * for normal test failures, but rather errors that prevented the adapter
   * from executing normally.
   */
  ADAPTER_ERROR: 1101,

  /*
   * Adapter was invoked, but did not return an exit code. This can happen if
   * the child process was terminated due to a signal:
   * https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
   */
  ADAPTER_RETURNED_NO_EXIT_CODE: 1102,
} as const

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
