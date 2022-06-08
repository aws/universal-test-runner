import path from 'path'
import { spawnSync } from 'child_process'

import {
  AdapterInput,
  AdapterOutput,
} from '@sentinel-internal/codeaws-test-runner'

export function executeTests({
  testNamesToRun = [],
}: AdapterInput): AdapterOutput {
  const executable = path.resolve('.', 'node_modules', '.bin', 'jest')
  const { status } = spawnSync(executable, ['-t', testNamesToRun.join('|')], {
    stdio: 'inherit',
  })
  return { exitCode: status ?? 1 }
}
