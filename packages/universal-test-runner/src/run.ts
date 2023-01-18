// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { log } from './log'
import {
  Adapter,
  AdapterInput,
  AdapterOutput,
} from '@aws/universal-test-runner-types'
import { ProtocolResult } from './readProtocol'
import { ErrorCodes } from '../bin/ErrorCodes'

function mapProtocolResultToAdapterInput(protocolResult: ProtocolResult): AdapterInput {
  return {
    testsToRun: protocolResult.testsToRun,
  }
}

export async function run(
  adapter: Adapter,
  protocolResult: ProtocolResult,
): Promise<AdapterOutput> {
  const adapterInput = mapProtocolResultToAdapterInput(protocolResult)
  try {
    log.info('Calling executeTests on adapter...')
    const adapterOutput = await adapter.executeTests(adapterInput)
    log.info('Finished executing tests.')
    if (adapterOutput.exitCode !== 0) {
      log.error(`Test run failed with exit code ${adapterOutput.exitCode}`)
    }
    return adapterOutput
  } catch (e) {
    log.error('Failed to run tests due to an adapter error.', e)
    return { exitCode: ErrorCodes.ADAPTER_ERROR }
  }
}
