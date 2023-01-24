// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Dotnet adapter', () => {
  let spawn: any

  beforeEach(() => {
    spawn = jest.fn(() => ({ status: 0 }))

    jest.resetModules()
    jest.doMock('@aws/universal-test-runner-spawn', () => ({ spawn }))
  })

  it('executes dotnet test when given tests of various compositions to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [
        { testName: 'TestGet' },
        {
          filepath: 'Company/ServerlessFunctions/UnitTests/ValuesControllerTests',
          testName: 'TestGet2',
        },
        { suiteName: 'ValuesControllerTests', testName: 'TestGet3' },
      ],
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('dotnet', [
      'test',
      '--filter',
      '(FullyQualifiedName~.TestGet) | ' +
        '(FullyQualifiedName~Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet2) | ' +
        '(FullyQualifiedName~.ValuesControllerTests.TestGet3)',
    ])
  })

  it('executes dotnet test when given tests of full compositions to run', async () => {
    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
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
    })

    expect(exitCode).toBe(0)
    expect(spawn).toHaveBeenCalledWith('dotnet', [
      'test',
      '--filter',
      '(FullyQualifiedName~Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet4) | ' +
        '(FullyQualifiedName~Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet5)',
    ])
  })
})
