import path from 'path'

import * as log from './log'
import { Adapter } from './adapter'

interface RunOptions {
  testNamesToRun?: string[]
}

type Process = Pick<typeof process, 'exit'>

async function run(
  adapterModule: string,
  { testNamesToRun }: RunOptions,
  processObject: Process,
) {
  try {
    const adapter: Adapter = await import(adapterModule).catch(
      () => import(path.resolve(process.cwd(), adapterModule)),
    )
    log.stderr(`Running tests with adapter: ${adapterModule}`)
    const { exitCode } = await adapter.executeTests({ testNamesToRun })
    log.stderr('Done.')
    processObject.exit(exitCode ?? 1)
  } catch (e) {
    log.stderr('Failed to run tests.', e)
    processObject.exit(1)
  }
}

export default run
