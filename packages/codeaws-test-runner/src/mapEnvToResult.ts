// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'

export type Environment = { [key: string]: string | undefined }

function mapEnvToResult<T>(
  env: Environment,
  key: string,
  mapper: (input: string | undefined) => T,
): T {
  const value = env[key]
  if (typeof value !== 'undefined') {
    log.stderr(`Found ${key} in environment, parsing value`)
  }
  return mapper(value)
}

export default mapEnvToResult
