// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Maven adapter', () => {
  let spawn: any

  beforeEach(() => {
    spawn = jest.fn(() => ({ status: 0 }))

    jest.resetModules()
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))
  })

  it('executes maven when given tests to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('mvn', ['-Dtest=#bill,#bob,#mary', 'test'])
  })

  it('executes maven when given tests and filepaths inlcuding filenames to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { filepath: 'dirA/dirB/file.java', testName: 'bill' },
        { filepath: 'dirA/dirB/file', testName: 'bob' },
        { filepath: 'dirA/dirB', suiteName: 'file', testName: 'mary' },
        { filepath: 'AppTest', suiteName: 'AppTest', testName: 'bob2' },
        { filepath: 'test/AppTest.java', suiteName: 'AppTest', testName: 'bob2' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('mvn', [
      '-Dtest=dirA/dirB/file#bill,dirA/dirB/file#bob,dirA/dirB/file#mary,AppTest#bob2,test/AppTest#bob2',
      'test',
    ])
  })

  it('executes maven when given test and suite', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { suiteName: 'bobby', testName: 'bill' },
        { suiteName: 'billy', testName: 'bob' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('mvn', ['-Dtest=bobby#bill,billy#bob', 'test'])
  })
})
