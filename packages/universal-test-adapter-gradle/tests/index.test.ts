// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Gradle adapter', () => {
  let spawn: any

  beforeEach(() => {
    spawn = jest.fn(() => ({ status: 0 }))

    jest.resetModules()
    jest.doMock('@sentinel-internal/universal-test-runner-spawn', () => ({ spawn }))
  })

  it('executes gradle when given tests to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('gradle', [
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
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { testName: 'bill' },
        { filepath: 'package/fileB.ext', testName: 'bob' },
        { suiteName: 'suiteC', testName: 'mary' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('gradle', [
      'test',
      '--tests',
      '*.*.bill',
      '--tests',
      '*package.*.bob',
      '--tests',
      '*.suiteC.mary',
    ])
  })

  it('executes gradle when given tests to run with file and suite names', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { filepath: 'fileA.py', suiteName: 'suiteA', testName: 'bill' },
        { filepath: 'orgB/packageB/fileB.py', suiteName: 'suiteB', testName: 'bob' },
        { filepath: 'fileC.py', suiteName: 'suiteC', testName: 'mary' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('gradle', [
      'test',
      '--tests',
      '*.suiteA.bill',
      '--tests',
      '*orgB.packageB.suiteB.bob',
      '--tests',
      '*.suiteC.mary',
    ])
  })
})
