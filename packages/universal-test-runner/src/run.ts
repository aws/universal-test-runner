// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { promises as fs } from 'fs'

import { log } from './log'
import {
  Adapter,
  AdapterInput,
  AdapterOutput,
  TestCase,
  ProtocolResult,
  RunnerContext,
} from '@aws/universal-test-runner-types'
import { ErrorCodes } from '../bin/ErrorCodes'

function parseTestCasesToRun(testCaseString: string | undefined): TestCase[] {
  const TEST_CASE_SEPARATOR = '|'
  const TEST_LOCATION_SEPARATOR = '#'

  return (
    testCaseString?.split(TEST_CASE_SEPARATOR).map((testCase) => {
      const [testName, suiteName, filepath] = testCase.split(TEST_LOCATION_SEPARATOR).reverse()
      return {
        testName,
        suiteName: suiteName || undefined,
        filepath: filepath || undefined,
      }
    }) ?? []
  )
}

async function getTestCaseString(protocolResult: ProtocolResult): Promise<string | undefined> {
  const { testsToRunFile, testsToRun } = protocolResult

  if (testsToRunFile) {
    try {
      return await fs.readFile(testsToRunFile, 'utf-8')
    } catch (e: any) {
      log.error(`Failed to read input file ${testsToRunFile}`)
      throw e
    }
  }

  return testsToRun
}

async function mapProtocolResultToAdapterInput(
  protocolResult: ProtocolResult,
): Promise<AdapterInput> {
  return {
    testsToRun: parseTestCasesToRun(await getTestCaseString(protocolResult)),
    reportFormat: protocolResult.reportFormat,
  }
}

export async function run(
  adapter: Adapter,
  protocolResult: ProtocolResult,
  context: RunnerContext = { extraArgs: [], cwd: process.cwd(), logLevel: 'info' },
): Promise<AdapterOutput> {
  const adapterInput = await mapProtocolResultToAdapterInput(protocolResult)
  try {
    log.info('Calling executeTests on adapter...')
    const adapterOutput = await adapter.executeTests(adapterInput, context)
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
