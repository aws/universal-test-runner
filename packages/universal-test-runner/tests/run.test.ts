// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import run from '../src/run'
import { ErrorCodes } from '../bin/ErrorCodes'

jest.mock('../src/log')

describe('Run function', () => {
  it('returns the exit code returned by the adapter', async () => {
    const mockAdapter = {
      executeTests() {
        return { exitCode: 123 }
      },
    }
    const output = await run(mockAdapter, { testsToRun: [], version: '0.1.0' })
    expect(output.exitCode).toBe(123)
  })

  it('returns the right exit code if the adapter throws an error', async () => {
    const mockAdapter = {
      executeTests() {
        throw new Error('Random failure')
      },
    }
    const output = await run(mockAdapter, { testsToRun: [], version: '0.1.0' })
    expect(output.exitCode).toBe(ErrorCodes.ADAPTER_ERROR)
  })
})
