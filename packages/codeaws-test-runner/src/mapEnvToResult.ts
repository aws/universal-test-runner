// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'

export type Environment = { [key: string]: string | undefined }

function mapEnvToResult<T>(
  env: Environment,
  keys: string[],
  mapper: (input: string | undefined) => T,
): T {
  let key, value
  for (const currentKey of keys) {
    ;[key, value] = [currentKey, env[currentKey]]
    if (typeof value !== 'undefined') {
      break
    }
  }
  if (typeof value !== 'undefined') {
    log.info(`Found ${key} in environment, reading value`)
  }
  return mapper(value)
}

export default mapEnvToResult
