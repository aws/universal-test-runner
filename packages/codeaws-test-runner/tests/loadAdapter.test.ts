// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'

jest.mock('../src/log')

function importLoadAdapter() {
  // loadAdapter must be imported dynamically in order to successfully
  // mock adapter paths with jest virtual mocks
  return import('../src/loadAdapter')
}

describe('Loading an adapter', () => {
  it('loads the correct adapter from an absolute path', async () => {
    const fullAdapterPath = path.join('my', 'full', 'path', 'adapter.js')
    const mockAdapter = { executeTests: () => ({ exitCode: 123 }) }
    jest.doMock(fullAdapterPath, () => mockAdapter, { virtual: true })
    const { loadAdapter } = await importLoadAdapter()

    const adapter = await loadAdapter(fullAdapterPath, process.cwd())

    expect(adapter.executeTests({ testsToRun: [] })).toEqual({ exitCode: 123 })
  })

  it('loads the correct adapter from a relative path', async () => {
    const directory = path.join('my', 'cool', 'dir')
    const adapterPath = './adapter.js'
    const fullAdapterPath = path.join(directory, adapterPath)
    const mockAdapter = { executeTests: () => ({ exitCode: 123 }) }
    jest.doMock(fullAdapterPath, () => mockAdapter, { virtual: true })
    const { loadAdapter } = await importLoadAdapter()

    const adapter = await loadAdapter(adapterPath, directory)

    expect(adapter.executeTests({ testsToRun: [] })).toEqual({ exitCode: 123 })
  })

  it('loads the adapter from the default export when one is provided', async () => {
    const fullAdapterPath = path.join('my', 'full', 'path', 'adapter.js')
    const mockAdapter = {
      __esModule: true,
      default: { executeTests: () => ({ exitCode: 123 }) },
      executeTests: () => ({ exitCode: 456 }),
    }
    jest.doMock(fullAdapterPath, () => mockAdapter, { virtual: true })
    const { loadAdapter } = await importLoadAdapter()

    const adapter = await loadAdapter(fullAdapterPath, process.cwd())

    expect(adapter.executeTests({ testsToRun: [] })).toEqual({ exitCode: 123 })
  })

  it.each(['blah', './blah.js'])(
    'throws an error when loading a non-existent adatper from %s',
    async (adapterPath: string) => {
      const { loadAdapter } = await importLoadAdapter()
      await expect(loadAdapter(adapterPath, process.cwd())).rejects.toEqual(
        expect.objectContaining({
          code: 'MODULE_NOT_FOUND',
        }),
      )
    },
  )
})
