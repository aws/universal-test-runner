import log from './log'
import { loadAdapter, AdapterInput } from './adapter'
import { DiscoveryResult } from './protocol'

type Process = Pick<typeof process, 'exit'>

function mapDiscoveryResultToAdapterInput(
  discoveryResult: DiscoveryResult,
): AdapterInput {
  return {
    testNamesToRun: discoveryResult.testNamesToRun,
  }
}

async function run(
  adapterModule: string,
  discoveryResult: DiscoveryResult,
  processObject: Process,
) {
  try {
    const adapter = await loadAdapter(adapterModule)
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
