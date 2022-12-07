// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('../src/log')

describe('Dotnet adapter', () => {
  it('executes dotnet test when given tests to run', async () => {
    const runCommand = jest.fn(() => ({ status: 0 }))
    jest.doMock('../src/runCommand', () => ({ runCommand }))

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({
      testsToRun: [{ testName: 'Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet' },
       { testName: 'Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet2' },
        { testName: 'Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet3' }],
    })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('dotnet', ['test', '--filter "(FullyQualifiedName=Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet) | (FullyQualifiedName=Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet2) | (FullyQualifiedName=Company.ServerlessFunctions.UnitTests.ValuesControllerTests.TestGet3)"'])
  })
})
