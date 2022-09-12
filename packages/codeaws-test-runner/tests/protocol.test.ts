// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import readProtocol from '../src/protocol'

jest.mock('../src/log')

describe('Protocol reading function', () => {
  describe('when parsing CAWS_TEST_NAMES_TO_RUN', () => {
    it('reads a list of test names', () => {
      const result = readProtocol({
        CAWS_TEST_NAMES_TO_RUN: 'test1|test4|test9',
        TEP_VERSION: '0.1.0',
      })
      expect(result.testsToRun).toEqual([
        { testName: 'test1' },
        { testName: 'test4' },
        { testName: 'test9' },
      ])
    })

    it('reads an empty list when value is not present', () => {
      const result = readProtocol({ TEP_VERSION: '0.1.0' })
      expect(result.testsToRun).toEqual([])
    })
  })
})
