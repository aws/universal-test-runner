import log from './log'
import { Adapter, AdapterInput } from './adapter'
import { DiscoveryResult } from './protocol'

type Process = Pick<typeof process, 'exit'>

function mapDiscoveryResultToAdapterInput(discoveryResult: DiscoveryResult): AdapterInput {
  return {
    testNamesToRun: discoveryResult.testNamesToRun,
  }
}

async function run(adapter: Adapter, discoveryResult: DiscoveryResult, processObject: Process) {
  try {
    const adapterInput = mapDiscoveryResultToAdapterInput(discoveryResult)
    log.stderr('Calling executeTests on adapter...')
    const { exitCode } = await adapter.executeTests(adapterInput)
    log.stderr('Finished executing tests.')
    processObject.exit(exitCode ?? 1)
  } catch (e) {
    log.stderr('Failed to run tests.', e)
    processObject.exit(1)
  }
}

export default run
