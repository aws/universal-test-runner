// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'

export interface DiscoveryResult {
  testNamesToRun: string[]
}

type Environment = { [key: string]: string | undefined }

function discoverTestNamesToRun(input: string | undefined): string[] {
  return input?.split('|') ?? []
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
    testNamesToRun: mapEnvToResult(env, 'CAWS_TEST_NAMES_TO_RUN', discoverTestNamesToRun),
  }
}

export default discover
