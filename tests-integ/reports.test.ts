// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runSetupScript, runCli, remove, readFile } from './helpers'

const ADAPTERS: [string, string, (contents: string) => boolean][] = [
  ['jest', 'junit.xml', verifyJunitReport],
  ['pytest', 'junit.xml', verifyJunitReport],
  ['dotnet', 'results.trx', verifyTrxReport],
]

describe.each(ADAPTERS)('%s adapter', (adapter, reportFile, verifyReport) => {
  it('generates a default report file', () => {
    runSetupScript(adapter)

    const { status } = runCli(adapter, {
      TEP_VERSION: '0.1.0',
      TEP_REPORT_FORMAT: 'default',
    })
    expect(status).toBe(0)

    const report = readFile(adapter, reportFile)
    expect(verifyReport(report)).toBe(true)

    remove(adapter, reportFile)
  })
})

function verifyJunitReport(contents: string): boolean {
  return (
    contents.includes('xml') && contents.includes('testsuites') && contents.includes('testcase')
  )
}

function verifyTrxReport(contents: string): boolean {
  return (
    contents.includes('xml') && contents.includes('TestRun') && contents.includes('UnitTestResult')
  )
}
