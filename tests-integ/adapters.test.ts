// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  runSetupScript,
  runCli,
  remove,
  parseLogFile,
  parseTestsToRun,
  parseTestsToRunWithFileAndSuite,
} from './helpers'

const ADAPTERS = ['jest', 'pytest', 'maven', 'gradle', 'dotnet']
const ADAPTER_FILE_AND_SUITE_SUPPORT = ['pytest']

describe.each(ADAPTERS)('%s adapter', (adapter) => {
  beforeAll(() => {
    runSetupScript(adapter)
  })

  afterEach(() => {
    remove(adapter, 'logs')
  })

  it('runs all tests', () => {
    const { status } = runCli(adapter, {
      TEP_VERSION: '0.1.0',
      TEP_LOG_FILE_NAME: 'logs/logs.json',
    })
    expect(status).toBe(0)

    const logs = parseLogFile(adapter, 'logs/logs.json')
    expect(logs).toMatchSnapshot()
  })

  it('runs a subset of tests', async () => {
    const { status } = runCli(adapter, {
      TEP_VERSION: '0.1.0',
      TEP_TESTS_TO_RUN: (await parseTestsToRun(adapter)) || 'test1|test2',
      TEP_LOG_FILE_NAME: 'logs/logs.json',
    })
    expect(status).toBe(0)

    const logs = parseLogFile(adapter, 'logs/logs.json')
    expect(logs).toMatchSnapshot()
  })

  if (ADAPTER_FILE_AND_SUITE_SUPPORT.includes(adapter)) {
    it('runs a subset of tests with file and suite input', async () => {
      const testsToRun = await parseTestsToRunWithFileAndSuite(adapter)
      const { status } = runCli(adapter, {
        TEP_VERSION: '0.1.0',
        TEP_TESTS_TO_RUN: testsToRun || '',
        TEP_LOG_FILE_NAME: 'logs/logs.json',
      })
      expect(status).toBe(0)

      const logs = parseLogFile(adapter, 'logs/logs.json')
      expect(logs).toMatchSnapshot()
    })
  }
})
