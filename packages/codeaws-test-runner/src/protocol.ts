// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import mapEnvToResult, { Environment } from './mapEnvToResult'
import log from './log'

interface TestCase {
  testName: string
  suiteName?: string
  filepath?: string
}

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
  log.stderr(`Using Test Execution Protocol version ${input}`)
  return input
}

function readTestsToRun(input: string | undefined): TestCase[] {
  return input?.split('|').map((testName) => ({ testName })) ?? []
}

function readProtocol(env: Environment): ProtocolResult {
  return {
    version: mapEnvToResult(env, ['TEP_VERSION'], readVersion),
    testsToRun: mapEnvToResult(env, ['TEP_TESTS_TO_RUN', 'CAWS_TEST_NAMES_TO_RUN'], readTestsToRun),
  }
}

export default readProtocol
