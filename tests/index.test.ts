import run from '../src'

jest.mock('../src/log')

describe('dummy test', () => {
  it('passes', () => {
    expect(() => run('blah', { testNamesToRun: [] })).toThrow()
  })

  it('has a second test', () => {
    expect(1 + 1).toBe(2)
  })
})
