// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'

jest.mock('../src/log')

describe('Loading an adapter', () => {
  it('loads the correct adapter from an absolute path', async () => {
    const fullAdapterPath = path.join('my', 'full', 'path', 'adapter.js')
    const mockAdapter = { executeTests: () => ({ exitCode: 123 }) }
    jest.doMock(fullAdapterPath, () => mockAdapter, { virtual: true })
    const { loadAdapter } = await import('../src/adapter')

    const adapter = await loadAdapter(fullAdapterPath, process)

    expect(adapter.executeTests({ testNamesToRun: [] })).toEqual({ exitCode: 123 })
  })

  it('loads the correct adapter from a relative path', async () => {
    const directory = path.join('my', 'cool', 'dir')
    const adapterPath = './adapter.js'
    const fullAdapterPath = path.join(directory, adapterPath)
    const mockAdapter = { executeTests: () => ({ exitCode: 123 }) }
    jest.doMock(fullAdapterPath, () => mockAdapter, { virtual: true })
    const { loadAdapter } = await import('../src/adapter')

    const adapter = await loadAdapter(adapterPath, { cwd: () => directory })

    expect(adapter.executeTests({ testNamesToRun: [] })).toEqual({ exitCode: 123 })
  })

  it('loads the adapter from the default export when one is provided', async () => {
    const fullAdapterPath = path.join('my', 'full', 'path', 'adapter.js')
    const mockAdapter = {
      __esModule: true,
      default: { executeTests: () => ({ exitCode: 123 }) },
      executeTests: () => ({ exitCode: 456 }),
    }
    jest.doMock(fullAdapterPath, () => mockAdapter, { virtual: true })
    const { loadAdapter } = await import('../src/adapter')

    const adapter = await loadAdapter(fullAdapterPath, process)

    expect(adapter.executeTests({ testNamesToRun: [] })).toEqual({ exitCode: 123 })
  })

  it.each(['blah', './blah.js'])(
    'throws an error when loading a non-existent adatper from %s',
    async (adapterPath: string) => {
      const { loadAdapter } = await import('../src/adapter')
      expect.assertions(1)
      try {
        await loadAdapter(adapterPath, process)
      } catch (e: any) {
        expect(e.code).toBe('MODULE_NOT_FOUND')
      }
    },
  )
})
