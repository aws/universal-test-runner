import discover from '../src/protocol'

jest.mock('../src/log')

describe('Discovery function', () => {
  describe('when parsing CAWS_TEST_NAMES_TO_RUN', () => {
    it('discovers a list of test names', () => {
      const result = discover({ CAWS_TEST_NAMES_TO_RUN: 'test1|test4|test9' })
      expect(result.testNamesToRun).toEqual(['test1', 'test4', 'test9'])
    })

    it('discovers an empty list when value is not present', () => {
      const result = discover({})
      expect(result.testNamesToRun).toEqual([])
    })
  })
})
