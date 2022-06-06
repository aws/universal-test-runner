import path from 'path'

import * as log from './log'
import { Adapter } from './adapter'

interface RunOptions {
  testNamesToRun?: string[]
}

async function run(adapterModule: string, { testNamesToRun }: RunOptions) {
  try {
    const adapter: Adapter = await import(adapterModule).catch(
      () => import(path.resolve(process.cwd(), adapterModule)),
    )
    log.stderr(`Running tests with adapter: ${adapterModule}`)
    const { exitCode } = await adapter.executeTests({ testNamesToRun })
    log.stderr('Done.')
    process.exit(exitCode ?? 1)
  } catch (e) {
    log.stderr('Failed to run tests.', e)
    process.exit(1)
  }
}

export default run
