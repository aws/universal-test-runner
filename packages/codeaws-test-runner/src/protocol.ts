// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'

interface TestCase {
  testName: string
  suiteName?: string
  filepath?: string
}

export interface DiscoveryResult {
  testsToRun: TestCase[]
}

type Environment = { [key: string]: string | undefined }

function discoverTestNamesToRun(input: string | undefined): TestCase[] {
  return input?.split('|').map((testName) => ({ testName })) ?? []
}

function mapEnvToResult<T>(
  env: Environment,
  key: string,
  mapper: (input: string | undefined) => T,
): T {
  const value = env[key]
  if (typeof value !== 'undefined') {
    log.stderr(`Discovered ${key} in environment, parsing value`)
  }
  return mapper(value)
}

function discover(env: Environment): DiscoveryResult {
  return {
    testsToRun: mapEnvToResult(env, 'CAWS_TEST_NAMES_TO_RUN', discoverTestNamesToRun),
  }
}

export default discover
