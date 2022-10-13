// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'

export type Environment = { [key: string]: string | undefined }

/*
 * Loads a key from the given env, retrieving the value of the first key found
 * in the list of keys, then applies the mapper function and returns the value.
 * Populates envSubset with the raw key and value read from the environment.
 *
 * e.g. Given that the environment variables NODE_ENV="PROD" and
 * NODE_ENVIRONMENT="BETA" are set:
 *
 * ```
 * mapEnvToResult(process.env, ['NODE_ENV', 'NODE_ENVIRONMENT'], val => val?.toLowerCase())
 * ```
 *
 * returns the string "prod". If NODE_ENV was NOT set, it would return "beta".
 */
function mapEnvToResult<T>(
  env: Environment,
  keys: string[],
  mapper: (input: string | undefined) => T,
  envSubset: Environment,
): T {
  let key, value
  for (const currentKey of keys) {
    ;[key, value] = [currentKey, env[currentKey]]
    if (typeof value !== 'undefined') {
      envSubset[key] = value
      break
    }
  }
  if (typeof value !== 'undefined') {
    log.info(`Found ${key} in environment, reading value`)
  }
  return mapper(value)
}

export default mapEnvToResult
