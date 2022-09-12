// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'
import { Adapter, AdapterInput } from './adapter'
import { ProtocolResult } from './protocol'

type Process = Pick<typeof process, 'exit'>

function mapProtocolResultToAdapterInput(protocolResult: ProtocolResult): AdapterInput {
  return {
    testsToRun: protocolResult.testsToRun,
  }
}

async function run(adapter: Adapter, protocolResult: ProtocolResult, processObject: Process) {
  try {
    const adapterInput = mapProtocolResultToAdapterInput(protocolResult)
    log.stderr('Calling executeTests on adapter...')
    const { exitCode } = await adapter.executeTests(adapterInput)
    log.stderr('Finished executing tests.')
    processObject.exit(exitCode ?? 1)
  } catch (e) {
    log.stderr('Failed to run tests.', e)
    processObject.exit(1)
  }
}

export default run
