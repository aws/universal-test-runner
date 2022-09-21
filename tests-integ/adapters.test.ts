// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runSetupScript, runCli, parseJunitReport, remove } from './helpers'

const ADAPTERS = ['jest', 'pytest']

// Still have to figure out reporting for maven and gradle
// For now just run integ tests just with assertions on exit status
const ADAPTERS_WITH_PENDING_REPORT_SUPPORT = ['maven', 'gradle']

describe.each(ADAPTERS)('%s adapter', (adapter) => {
  beforeAll(() => {
    runSetupScript(adapter)
  })

  afterEach(() => {
    remove(adapter, 'reports')
  })

  it('runs all tests', () => {
    runCli(adapter, {
      TEP_VERSION: '0.1.0',
      TEP_TEST_REPORT_FORMAT: 'junitxml',
      TEP_TEST_REPORT_OUTPUT_DIR: 'reports',
      TEP_TEST_REPORT_FILE_NAME: 'report.xml',
    })
    const report = parseJunitReport(adapter, 'reports/report.xml')
    expect(report).toMatchSnapshot()
  })

  it('runs a subset of tests', () => {
    runCli(adapter, {
      TEP_VERSION: '0.1.0',
      TEP_TESTS_TO_RUN: 'test1|test2',
      TEP_TEST_REPORT_FORMAT: 'junitxml',
      TEP_TEST_REPORT_OUTPUT_DIR: 'reports',
      TEP_TEST_REPORT_FILE_NAME: 'report.xml',
    })
    const report = parseJunitReport(adapter, 'reports/report.xml')
    expect(report).toMatchSnapshot()
  })
})

describe.each(ADAPTERS_WITH_PENDING_REPORT_SUPPORT)('%s adapter', (adapter) => {
  beforeAll(() => {
    runSetupScript(adapter)
  })

  it('runs all tests', () => {
    const { status } = runCli(adapter, {
      TEP_VERSION: '0.1.0',
    })
    expect(status).toBe(0)
  })

  it('runs a subset of tests', () => {
    const { status } = runCli(adapter, {
      TEP_VERSION: '0.1.0',
      TEP_TESTS_TO_RUN: 'test1|test2',
    })
    expect(status).toBe(0)
  })
})
