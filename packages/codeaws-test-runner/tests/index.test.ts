import run from '../src'

jest.mock('../src/log')

describe('dummy test', () => {
  it('has one test', async () => {
    const processSpy = {
      exit: jest.fn<never, [number]>(),
    }
    await run('blah', { testNamesToRun: [] }, processSpy)
    expect(processSpy.exit).toHaveBeenCalledWith(1)
  })

  it('has a second test', () => {
    expect(1 + 1).toBe(2)
  })
})
