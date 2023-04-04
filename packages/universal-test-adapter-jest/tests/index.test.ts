// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RunnerContext } from '@aws/universal-test-runner-types'

jest.mock('../src/log')

describe('Jest adapter', () => {
  let spawn: any
  let mockContext: RunnerContext

  beforeEach(() => {
    spawn = jest.fn(() => ({ status: 0 }))
    mockContext = { cwd: '/mock/cwd', extraArgs: [], logLevel: 'info' }

    jest.resetModules()
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))
    jest.doMock('../src/buildBaseTestCommand', () => ({
      buildBaseTestCommand: () => ['jest', []],
    }))
  })

  it('executes jest when given tests to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      { testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }] },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('jest', ['--testNamePattern', '(bill)|(bob)|(mary)'])
  })

  it('excludes filepaths when not included in every entry', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [
          { testName: 'bill' },
          { filepath: 'package/fileB.ext', testName: 'bob' },
          { suiteName: 'suiteC', testName: 'mary' },
        ],
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('jest', ['--testNamePattern', '(bill)|(bob)|(suiteC mary)'])
  })

  it('converts filepaths to globs correctly', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [
          { filepath: 'package/fileB.ext', testName: 'bob' },
          { filepath: '.*/package/.*/dirC/fileC.ext', testName: 'bob', suiteName: 'w' },
          { filepath: '\\package\\dirA\\fileD.ext', testName: 'bob' },
        ],
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('jest', [
      '--testPathPattern',
      '(package/fileB.ext)|(.*/package/.*/dirC/fileC.ext)|(/package/dirA/fileD.ext)',
      '--testNamePattern',
      '(bob)|(w bob)|(bob)',
    ])
  })

  it('adds the correct arguments for report generation', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [{ testName: 'bill' }, { testName: 'bob' }, { testName: 'mary' }],
        reportFormat: 'default',
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('jest', [
      '--testNamePattern',
      '(bill)|(bob)|(mary)',
      '--reporters',
      'jest-junit',
      '--reporters',
      'default',
    ])
  })

  it('adds extra arguments when specified', async () => {
    mockContext.extraArgs = ['--config', './some/custom/config.js']

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [{ testName: 'one' }, { testName: 'two' }, { testName: 'three' }],
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('jest', [
      '--config',
      './some/custom/config.js',
      '--testNamePattern',
      '(one)|(two)|(three)',
    ])
  })
})
