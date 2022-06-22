import runCommand from './runCommand'
import log from './log'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/codeaws-test-runner'

export async function executeTests({ testNamesToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'mvn'
  const args = []
  if (testNamesToRun.length > 0) {
    args.push(`-Dtest=${testNamesToRun.map((name) => `#${name}`).join(',')}`)
  }
  args.push('test')
  log.stderr(`Running tests with maven using command: ${[executable, ...args].join(' ')}`)
  const { status } = await runCommand(executable, args)
  return { exitCode: status ?? 1 }
}
