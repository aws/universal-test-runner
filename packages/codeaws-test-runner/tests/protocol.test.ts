// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import _readProtocol from '../src/protocol'
import { Environment } from '../src/mapEnvToResult'

jest.mock('../src/log')

function readProtocol(env: Environment) {
  return _readProtocol({
    TEP_VERSION: '0.1.0',
    ...env,
  })
}

describe('Protocol reading function', () => {
  describe('when parsing TEP_TESTS_TO_RUN', () => {
    it('reads a list of test names', () => {
      const result = readProtocol({
        TEP_TESTS_TO_RUN: 'test1|test4|test9',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1' },
        { testName: 'test4' },
        { testName: 'test9' },
      ])
    })

    it('reads the test suite for a single test', () => {
      const result = readProtocol({
        TEP_TESTS_TO_RUN: 'test1|test4|suitename#test9',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1' },
        { testName: 'test4' },
        { testName: 'test9', suiteName: 'suitename' },
      ])
    })

    it('reads the test suite for a many tests', () => {
      const result = readProtocol({
        TEP_TESTS_TO_RUN: 'suite1#test1|suite2#test4|suitename#test9',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1', suiteName: 'suite1' },
        { testName: 'test4', suiteName: 'suite2' },
        { testName: 'test9', suiteName: 'suitename' },
      ])
    })

    it('reads the filepath only for many tests', () => {
      const result = readProtocol({
        TEP_TESTS_TO_RUN: 'file1.js##test1|file2.js##test4|file3.js##test9',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1', filepath: 'file1.js' },
        { testName: 'test4', filepath: 'file2.js' },
        { testName: 'test9', filepath: 'file3.js' },
      ])
    })

    it('reads the filepath only for one test', () => {
      const result = readProtocol({
        TEP_TESTS_TO_RUN: 'test1|test4|file3.js##test9',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1' },
        { testName: 'test4' },
        { testName: 'test9', filepath: 'file3.js' },
      ])
    })

    it('reads the filepath and suite name for one test', () => {
      const result = readProtocol({
        TEP_TESTS_TO_RUN: 'test1|test4|file3.js#suite1#test9',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1' },
        { testName: 'test4' },
        { testName: 'test9', suiteName: 'suite1', filepath: 'file3.js' },
      ])
    })

    it('reads an empty list when value is not present', () => {
      const result = readProtocol({})
      expect(result.testsToRun).toEqual([])
    })
  })
})
