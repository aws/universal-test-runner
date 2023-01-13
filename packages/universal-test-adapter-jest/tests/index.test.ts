// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Jest adapter', () => {
  it('executes jest when given tests to run', async () => {
    jest.doMock('../src/buildBaseTestCommand', () => ({
      buildBaseTestCommand: () => ['./node_modules/.bin/jest', []],
    }))

    const spawn = jest.fn(() => ({ status: 0 }))
    jest.doMock('@sentinel-internal/universal-test-runner-spawn', () => ({ spawn }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('./node_modules/.bin/jest', [
      '--testNamePattern',
      'bill|bob|mary',
    ])
  })
})
