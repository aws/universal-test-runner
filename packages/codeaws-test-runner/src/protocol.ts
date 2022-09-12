// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import mapEnvToResult, { Environment } from './mapEnvToResult'

interface TestCase {
  testName: string
  suiteName?: string
  filepath?: string
}

export interface ProtocolResult {
  testsToRun: TestCase[]
}

function readTestNamesToRun(input: string | undefined): TestCase[] {
  return input?.split('|').map((testName) => ({ testName })) ?? []
}

function readProtocol(env: Environment): ProtocolResult {
  return {
    testsToRun: mapEnvToResult(env, 'CAWS_TEST_NAMES_TO_RUN', readTestNamesToRun),
  }
}

export default readProtocol
