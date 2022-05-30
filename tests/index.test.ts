import run from '../src'

describe('dummy test', () => {
  it('passes', () => {
    expect(() => run('blah', {})).toThrow()
  })

  it('has a second test', () => {
    expect(1 + 1).toBe(2)
  })
})
