// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Gradle adapter', () => {
  it('executes gradle when given tests to run', async () => {
    const runCommand = jest.fn(() => ({ status: 0 }))
    jest.doMock('../src/runCommand', () => runCommand)

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({ testNamesToRun: ['bill', 'bob', 'mary'] })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('gradle', [
      'test',
      '--tests',
      '*bill',
      '--tests',
      '*bob',
      '--tests',
      '*mary',
    ])
  })
})
