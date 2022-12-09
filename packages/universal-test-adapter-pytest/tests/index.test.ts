// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Pytest adapter', () => {
  const runCommand = jest.fn(() => ({ status: 0 }))

  it('executes pytest when given tests to run', async () => {
    jest.doMock('../src/runCommand', () => ({ runCommand }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('pytest', ['-k', '(bill) or (bob) or (mary)'])
  })

  it('executes pytest when given tests to run with file or suite names', async () => {
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
    expect(runCommand).toHaveBeenCalledWith('pytest', [
      '-k',
      '(bill) or (fileB.py and bob) or (suiteC and mary)',
    ])
  })

  it('executes pytest when given tests to run with file and suite names', async () => {
    jest.doMock('../src/runCommand', () => ({ runCommand }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { filepath: 'fileA.py', suiteName: 'suiteA', testName: 'bill' },
        { filepath: 'fileB.py', suiteName: 'suiteB', testName: 'bob' },
        { filepath: 'fileC.py', suiteName: 'suiteC', testName: 'mary' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('pytest', [
      '-v',
      'fileA.py::suiteA::bill fileB.py::suiteB::bob fileC.py::suiteC::mary',
    ])
  })
})
