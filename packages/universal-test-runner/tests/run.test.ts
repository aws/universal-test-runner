// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { run } from '../src/run'
import { ErrorCodes } from '../bin/ErrorCodes'
import { Adapter } from '@aws/universal-test-runner-types'
import { vol } from 'memfs'

jest.mock('../src/log')
jest.mock('fs')

const EMPTY_CONTEXT = { cwd: process.cwd(), extraArgs: [] }

describe('Run function', () => {
  beforeEach(() => {
    vol.reset()
  })

  it('returns the exit code returned by the adapter', async () => {
    const mockAdapter = {
      executeTests() {
        return { exitCode: 123 }
      },
    }
    const output = await run(mockAdapter, { version: '0.1.0' })
    expect(output.exitCode).toBe(123)
  })

  it('returns the right exit code if the adapter throws an error', async () => {
    const mockAdapter = {
      executeTests() {
        throw new Error('Random failure')
      },
    }
    const output = await run(mockAdapter, { version: '0.1.0' })
    expect(output.exitCode).toBe(ErrorCodes.ADAPTER_ERROR)
  })

  describe('when parsing tests to run', () => {
    let mockAdapter: Adapter

    beforeEach(() => {
      mockAdapter = { executeTests: jest.fn(() => ({ exitCode: 0 })) }
    })

    it('reads a list of test names', async () => {
      await run(mockAdapter, { version: '0.1.0', testsToRun: 'test1|test4|test9' })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith(
        { testsToRun: [{ testName: 'test1' }, { testName: 'test4' }, { testName: 'test9' }] },
        EMPTY_CONTEXT,
      )
    })

    it('reads the test suite for a single test', async () => {
      await run(mockAdapter, { version: '0.1.0', testsToRun: 'test1|test4|suitename#test9' })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith(
        {
          testsToRun: [
            { testName: 'test1' },
            { testName: 'test4' },
            { testName: 'test9', suiteName: 'suitename' },
          ],
        },
        EMPTY_CONTEXT,
      )
    })

    it('reads the test suite for a many tests', async () => {
      await run(mockAdapter, {
        version: '0.1.0',
        testsToRun: 'suite1#test1|suite2#test4|suitename#test9',
      })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith(
        {
          testsToRun: [
            { testName: 'test1', suiteName: 'suite1' },
            { testName: 'test4', suiteName: 'suite2' },
            { testName: 'test9', suiteName: 'suitename' },
          ],
        },
        EMPTY_CONTEXT,
      )
    })

    it('reads the filepath only for many tests', async () => {
      await run(mockAdapter, {
        version: '0.1.0',
        testsToRun: 'file1.js##test1|file2.js##test4|file3.js##test9',
      })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith(
        {
          testsToRun: [
            { testName: 'test1', filepath: 'file1.js' },
            { testName: 'test4', filepath: 'file2.js' },
            { testName: 'test9', filepath: 'file3.js' },
          ],
        },
        EMPTY_CONTEXT,
      )
    })

    it('reads the filepath only for one test', async () => {
      await run(mockAdapter, { version: '0.1.0', testsToRun: 'test1|test4|file3.js##test9' })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith(
        {
          testsToRun: [
            { testName: 'test1' },
            { testName: 'test4' },
            { testName: 'test9', filepath: 'file3.js' },
          ],
        },
        EMPTY_CONTEXT,
      )
    })

    it('reads the filepath and suite name for one test', async () => {
      await run(mockAdapter, { version: '0.1.0', testsToRun: 'test1|test4|file3.js#suite1#test9' })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith(
        {
          testsToRun: [
            { testName: 'test1' },
            { testName: 'test4' },
            { testName: 'test9', suiteName: 'suite1', filepath: 'file3.js' },
          ],
        },
        EMPTY_CONTEXT,
      )
    })

    it('reads an empty list when value is not present', async () => {
      await run(mockAdapter, { version: '0.1.0' })

      expect(mockAdapter.executeTests).toHaveBeenCalledWith({ testsToRun: [] }, EMPTY_CONTEXT)
    })
  })

  it('reads test cases to run from a file', async () => {
    vol.fromJSON(
      {
        './verycoolfile': 'test1|test4|test9',
      },
      '/tmp',
    )

    const mockAdapter = { executeTests: jest.fn(() => ({ exitCode: 0 })) }

    await run(mockAdapter, { version: '0.1.0', testsToRunFile: '/tmp/verycoolfile' })

    expect(mockAdapter.executeTests).toHaveBeenCalledWith(
      {
        testsToRun: [{ testName: 'test1' }, { testName: 'test4' }, { testName: 'test9' }],
      },
      EMPTY_CONTEXT,
    )
  })

  it('throws an error if test cases cannot be read from a file', async () => {
    const mockAdapter = { executeTests: jest.fn(() => ({ exitCode: 0 })) }

    await expect(
      run(mockAdapter, { version: '0.1.0', testsToRunFile: '/tmp/verycoolfile' }),
    ).rejects.toMatchInlineSnapshot(
      `[Error: ENOENT: no such file or directory, open '/tmp/verycoolfile']`,
    )
  })

  it('prefers tests to run input from file over environment variable', async () => {
    vol.fromJSON(
      {
        './verycoolfile': 'test1|test4|test9',
      },
      '/tmp',
    )

    const mockAdapter = { executeTests: jest.fn(() => ({ exitCode: 0 })) }

    await run(mockAdapter, {
      version: '0.1.0',
      testsToRunFile: '/tmp/verycoolfile',
      testsToRun: 'wont|be|executed',
    })

    expect(mockAdapter.executeTests).toHaveBeenCalledWith(
      {
        testsToRun: [{ testName: 'test1' }, { testName: 'test4' }, { testName: 'test9' }],
      },
      EMPTY_CONTEXT,
    )
  })
})
