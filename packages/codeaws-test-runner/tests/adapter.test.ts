import { loadAdapter } from '../src/adapter'
import fs from 'fs'
import os from 'os'
import path from 'path'

jest.mock('../src/log')

describe('Loading an adapter', () => {
  it('loads the correct adapter', async () => {
    const adapterPath = path.join(os.tmpdir(), `adapter-${Date.now()}.js`)
    fs.writeFileSync(adapterPath, `exports.executeTests = () => ({ exitCode: 123 })`)

    const adapter = await loadAdapter(adapterPath)

    expect(adapter.executeTests({ testNamesToRun: [] })).toEqual({ exitCode: 123 })
    fs.unlinkSync(adapterPath)
  })

  it('throws an error when failing to load the adapter', async () => {
    expect.assertions(1)
    try {
      await loadAdapter('blah.js')
    } catch (e: any) {
      expect(e.code).toBe('MODULE_NOT_FOUND')
    }
  })
})
