import { loadAdapter } from '../src/adapter'
import fs from 'fs'
import os from 'os'
import path from 'path'

jest.mock('../src/log')

describe('Loading an adapter', () => {
  it('loads the correct adapter from an absolute path', async () => {
    const fullAdapterPath = path.join(os.tmpdir(), `adapter-${Date.now()}.js`)
    fs.writeFileSync(fullAdapterPath, `exports.executeTests = () => ({ exitCode: 123 })`)

    const adapter = await loadAdapter(fullAdapterPath, process)

    expect(adapter.executeTests({ testNamesToRun: [] })).toEqual({ exitCode: 123 })
    fs.unlinkSync(fullAdapterPath)
  })

  it('loads the correct adapter from a relative path', async () => {
    const directory = os.tmpdir()
    const adapterPath = `./adapter-${Date.now()}.js`
    const fullAdapterPath = path.join(directory, adapterPath)
    fs.writeFileSync(fullAdapterPath, `exports.executeTests = () => ({ exitCode: 123 })`)

    const adapter = await loadAdapter(adapterPath, { cwd: () => directory })

    expect(adapter.executeTests({ testNamesToRun: [] })).toEqual({ exitCode: 123 })
    fs.unlinkSync(fullAdapterPath)
  })

  it.each(['blah', './blah.js'])(
    'throws an error when loading a non-existent adatper from %s',
    async (adapterPath: string) => {
      expect.assertions(1)
      try {
        await loadAdapter(adapterPath, process)
      } catch (e: any) {
        expect(e.code).toBe('MODULE_NOT_FOUND')
      }
    },
  )
})
