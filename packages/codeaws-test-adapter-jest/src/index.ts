import path from 'path'
import { spawnSync } from 'child_process'
import { accessSync, constants } from 'fs'
import log from './log'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/codeaws-test-runner'

export function executeTests({ testNamesToRun = [] }: AdapterInput): AdapterOutput {
  const executable = path.resolve('.', 'node_modules', '.bin', 'jest')
  try {
    accessSync(executable, constants.X_OK)
  } catch (e) {
    throw new Error(`Could not find jest executable! Checked ${executable}`)
  }
  const args = []
  if (testNamesToRun.length > 0) {
    args.push('-t', testNamesToRun.join('|'))
  }
  log.stderr(`Invoking jest with command: ${[executable, ...args].join(' ')}`)
  const { status } = spawnSync(executable, args, { stdio: 'inherit' })
  return { exitCode: status ?? 1 }
}
