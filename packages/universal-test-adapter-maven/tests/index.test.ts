// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Maven adapter', () => {
  it('executes maven when given tests to run', async () => {
    const spawn = jest.fn(() => ({ status: 0 }))
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('mvn', ['-Dtest=#bill,#bob,#mary', 'test'])
  })
})
