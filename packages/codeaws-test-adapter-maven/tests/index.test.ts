jest.mock('../src/log')

describe('Maven adapter', () => {
  it('executes maven when given tests to run', async () => {
    const runCommand = jest.fn(() => ({ status: 0 }))
    jest.doMock('../src/runCommand', () => runCommand)

    const { executeTests } = await import('../src/index')

    const { exitCode } = await executeTests({ testNamesToRun: ['bill', 'bob', 'mary'] })

    expect(exitCode).toBe(0)
    expect(runCommand).toHaveBeenCalledWith('mvn', ['-Dtest=#bill,#bob,#mary', 'test'])
  })
})
