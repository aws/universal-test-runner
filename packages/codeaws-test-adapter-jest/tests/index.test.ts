// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Jest adapter', () => {
  it('executes jest when given tests to run', async () => {
    jest.doMock('../src/buildBaseTestCommand', () => () => ['./node_modules/.bin/jest', []])

    const runCommand = jest.fn(() => ({ status: 0 }))
    jest.doMock('../src/runCommand', () => runCommand)

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('./node_modules/.bin/jest', [
      '--testNamePattern',
      'bill|bob|mary',
    ])
  })
})
