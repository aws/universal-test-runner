// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runSetupScript, runCli, remove, readFile } from './helpers'

describe('jest adapter', () => {
  it('generates a report file', () => {
    runSetupScript('jest')

    const { status } = runCli('jest', {
      TEP_VERSION: '0.1.0',
      TEP_REPORT_FORMAT: 'default',
    })
    expect(status).toBe(0)

    const report = readFile('jest', 'junit.xml')
    expect(report).toContain('xml')
    expect(report).toContain('testsuites')
    expect(report).toContain('testcase')

    remove('jest', 'junit.xml')
  })
})
