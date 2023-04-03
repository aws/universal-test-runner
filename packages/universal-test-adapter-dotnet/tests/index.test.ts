// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RunnerContext } from '@aws/universal-test-runner-types'

jest.mock('../src/log')

describe('Dotnet adapter', () => {
  let spawn: any
  let mockContext: RunnerContext

  beforeEach(() => {
    spawn = jest.fn(() => ({ status: 0 }))
    mockContext = { cwd: '/mock/cwd', extraArgs: [], logLevel: 'info' }

    jest.resetModules()
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))
  })

  it('executes dotnet test when given tests of various compositions to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [
          { testName: 'TestGet' },
          {
            filepath: 'Company/ServerlessFunctions/UnitTests/ValuesControllerTests.java',
            testName: 'TestGet2',
          },
          { suiteName: 'ValuesControllerTests', testName: 'TestGet3' },
        ],
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('dotnet', [
      'test',
      '--filter',
      '(FullyQualifiedName~.TestGet) | ' +
        '(FullyQualifiedName~Company.ServerlessFunctions.UnitTests.ValuesControllerTests & FullyQualifiedName~.TestGet2) | ' +
        '(FullyQualifiedName~.ValuesControllerTests.TestGet3)',
    ])
  })

  it('executes dotnet test when given tests of full compositions to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [
          {
            filepath: 'Company/ServerlessFunctions/UnitTests/',
            suiteName: 'ValuesControllerTests',
            testName: 'TestGet4',
          },
          {
            filepath: 'Company/ServerlessFunctions/UnitTests/ValuesControllerTests',
            suiteName: 'ValuesControllerTests',
            testName: 'TestGet5',
          },
        ],
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('dotnet', [
      'test',
      '--filter',
      '(FullyQualifiedName~Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet4) | ' +
        '(FullyQualifiedName~Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet5)',
    ])
  })

  it('passes the right arguments for default report format', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [{ testName: 'TestGet' }],
        reportFormat: 'default',
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('dotnet', [
      'test',
      '--filter',
      '(FullyQualifiedName~.TestGet)',
      '--logger',
      `trx;LogFileName=/mock/cwd/results.trx`,
      '--logger',
      'console',
    ])
  })

  it('adds extra arguments when specified', async () => {
    mockContext.extraArgs = ['--additional-deps', './deps.json']

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests(
      {
        testsToRun: [{ testName: 'TestGet' }],
      },
      mockContext,
    )

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('dotnet', [
      '--additional-deps',
      './deps.json',
      'test',
      '--filter',
      '(FullyQualifiedName~.TestGet)',
    ])
  })
})
