// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Gradle adapter', () => {
  const runCommand = jest.fn(() => ({ status: 0 }))

  it('executes gradle when given tests to run', async () => {
    jest.doMock('../src/runCommand', () => ({ runCommand }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('gradle', [
      'test',
      '--tests',
      '*.*.bill',
      '--tests',
      '*.*.bob',
      '--tests',
      '*.*.mary',
    ])
  })

  it('executes gradle when given tests to run with file or suite names', async () => {
    jest.doMock('../src/runCommand', () => ({ runCommand }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { testName: 'bill' },
        { filepath: 'fileB.py', testName: 'bob' },
        { suiteName: 'suiteC', testName: 'mary' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('gradle', [
      'test',
      '--tests',
      '*.*.bill',
      '--tests',
      '*.*.bob',
      '--tests',
      '*.*.mary',
    ])
  })

  it('executes gradle when given tests to run with file and suite names', async () => {
    jest.doMock('../src/runCommand', () => ({ runCommand }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { filepath: 'fileA.py', suiteName: 'suiteA', testName: 'bill' },
        { filepath: 'packageB/fileB.py', suiteName: 'suiteB', testName: 'bob' },
        { filepath: 'fileC.py', suiteName: 'suiteC', testName: 'mary' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('gradle', [
      'test',
      '--tests',
      '*.suiteA.bill',
      '--tests',
      'packageB.suiteB.bob',
      '--tests',
      '*.suiteC.mary',
    ])
  })
})
