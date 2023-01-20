// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Jest adapter', () => {
  let spawn: any

  beforeEach(() => {
    spawn = jest.fn(() => ({ status: 0 }))

    jest.resetModules()
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))
  })

  it('executes jest when given tests to run', async () => {
    jest.doMock('../src/buildBaseTestCommand', () => ({
      buildBaseTestCommand: () => ['./node_modules/.bin/jest', []],
    }))

    const spawn = jest.fn(() => ({ status: 0 }))
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('./node_modules/.bin/jest', [
      '--testNamePattern',
      '\'(bill)|(bob)|(mary)\'',
    ])
  })

  it('excludes filepaths when not included in every entry', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { testName: 'bill' },
        { filepath: 'package/fileB.ext', testName: 'bob' },
        { suiteName: 'suiteC', testName: 'mary' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('./node_modules/.bin/jest', [
      '--testNamePattern',
      '\'(bill)|(bob)|(suiteC mary)\'',
    ])
  })

  it('converts filepaths to globs correctly', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { filepath: 'package/dirA',  testName: 'bob' },
        { filepath: 'package/fileB.ext', testName: 'bob' },
        { filepath: '.*/package/.*/dirB/.*',  testName: 'bob', suiteName: 'w' },
        { filepath: '/package/.*/dirB',  testName: 'bob' },
        { filepath: '\\package\\dirA',  testName: 'bob' },

      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('./node_modules/.bin/jest', [
      '--testMatch',
      '\'**/package/dirA/** **/package/fileB.ext **/package/**/dirB/** **/package/**/dirB/** **/package/dirA/**\'',
      '--testNamePattern',
      '\'(bob)|(bob)|(w bob)|(bob)|(bob)\'',
    ])
  })



})
