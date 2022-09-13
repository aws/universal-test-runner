// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import mapEnvToResult, { Environment } from './mapEnvToResult'
import log from './log'

interface TestCase {
  testName: string
  suiteName?: string
  filepath?: string
}

export const EnvVars = {
  /*
   * The version of the protocol being used, e.g. '0.1.0'
   */
  VERSION: 'TEP_VERSION',

  /*
   * Pipe-separated list of tests to be run. Suite name and filepath can be
   * specified optionally, using hashes. e.g.
   *
   * 'test1|test4|test9'
   * 'suite1#test1|suite2#test4|suite#test9'
   * 'file1.js#suite1#test1|file2.js#suite2#test4|file3.js#suite#test9'
   */
  TESTS_TO_RUN: 'TEP_TESTS_TO_RUN',
} as const

export interface ProtocolResult {
  version: string
  testsToRun: TestCase[]
}

function readVersion(input: string | undefined): string {
  if (!input) {
    throw new Error('Protocol version is not defined!')
  }
  if (input !== '0.1.0') {
    throw new Error(`Protocol version ${input} is not supported by this runner`)
  }
  log.info(`Using Test Execution Protocol version ${input}`)
  return input
}

function readTestsToRun(input: string | undefined): TestCase[] {
  const TEST_CASE_SEPARATOR = '|'
  const TEST_LOCATION_SEPARATOR = '#'

  return (
    input?.split(TEST_CASE_SEPARATOR).map((testCase) => {
      const [testName, suiteName, filepath] = testCase.split(TEST_LOCATION_SEPARATOR).reverse()
      return {
        testName,
        suiteName: suiteName || undefined,
        filepath: filepath || undefined,
      }
    }) ?? []
  )
}

function readProtocol(env: Environment): ProtocolResult {
  return {
    version: mapEnvToResult(env, [EnvVars.VERSION], readVersion),
    testsToRun: mapEnvToResult(
      env,
      [
        EnvVars.TESTS_TO_RUN,
        // Keeping this old name around for now, for backwards compatibility
        'CAWS_TEST_NAMES_TO_RUN',
      ],
      readTestsToRun,
    ),
  }
}

export default readProtocol
