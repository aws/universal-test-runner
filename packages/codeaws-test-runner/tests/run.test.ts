// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import run from '../src/run'

jest.mock('../src/log')

function getProcessSpy() {
  return {
    exit: jest.fn<never, [number]>(),
  }
}

describe('Run function', () => {
  it('exits with the exit code returned by the adapter', async () => {
    const mockAdapter = {
      executeTests() {
        return { exitCode: 123 }
      },
    }
    const processSpy = getProcessSpy()
    await run(mockAdapter, { testNamesToRun: [] }, processSpy)
    expect(processSpy.exit).toHaveBeenCalledWith(123)
  })

  it('exits with a non-zero status code if the adapter throws an error', async () => {
    const mockAdapter = {
      executeTests() {
        throw new Error('Random failure')
      },
    }
    const processSpy = getProcessSpy()
    await run(mockAdapter, { testNamesToRun: [] }, processSpy)
    expect(processSpy.exit).toHaveBeenCalledWith(1)
  })

  it('exits with a non-zero status code if the adapter does not return an status code', async () => {
    const mockAdapter = {
      executeTests() {
        return { exitCode: null }
      },
    }
    const processSpy = getProcessSpy()
    await run(mockAdapter, { testNamesToRun: [] }, processSpy)
    expect(processSpy.exit).toHaveBeenCalledWith(1)
  })
})
