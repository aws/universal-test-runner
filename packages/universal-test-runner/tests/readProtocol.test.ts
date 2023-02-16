// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { readProtocol } from '../src/readProtocol'
import { ProtocolEnvVars } from '../src/ProtocolEnvVars'

jest.mock('../src/log')

const { VERSION, TESTS_TO_RUN, TESTS_TO_RUN_FILE, LOG_FILE_NAME, REPORT_FORMAT } = ProtocolEnvVars

describe('Protocol reading function', () => {
  it('returns the default version if none is specified', () => {
    const [result] = readProtocol({})
    expect(result.version).toBe('0.1.0')
  })

  it('reads the correct values from the environment', () => {
    const [result] = readProtocol({
      [VERSION]: '0.2.0',
      [TESTS_TO_RUN]: 'some|file#suite#tests|to|run',
      [TESTS_TO_RUN_FILE]: 'some/cool/file',
      [LOG_FILE_NAME]: 'some/cool/file.json',
      [REPORT_FORMAT]: 'default',
    })

    expect(result.version).toBe('0.2.0')
    expect(result.testsToRun).toBe('some|file#suite#tests|to|run')
    expect(result.testsToRunFile).toBe('some/cool/file')
    expect(result.logFileName).toBe('some/cool/file.json')
    expect(result.reportFormat).toBe('default')
  })

  it('returns the raw values from the environment', () => {
    const protocolInputs = {
      [VERSION]: '1.1.0',
      [TESTS_TO_RUN]: 'some|file#suite#tests|to|run',
      [TESTS_TO_RUN_FILE]: 'some/cool/file',
      [LOG_FILE_NAME]: 'some/cool/file.json',
      [REPORT_FORMAT]: 'default',
    }

    const environmentGarbage = {
      SOME_COOL_ENV_VAR: 'llamas',
      CODEBUILD_SRC_DIR: 'some/src/dir/to/a/thing',
      USER: 'donkeyman',
    }

    const [, rawValues] = readProtocol({
      ...environmentGarbage,
      ...protocolInputs,
    })

    expect(rawValues).toEqual(protocolInputs)
  })
})
