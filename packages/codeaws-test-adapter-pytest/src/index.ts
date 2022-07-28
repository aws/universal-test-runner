// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import runCommand from './runCommand'
import log from './log'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/codeaws-test-runner'

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'pytest'
  const args = []
  const testNamesToRun = testsToRun.map(({ testName }) => testName)
  if (testNamesToRun.length > 0) {
    args.push('-k', `${testNamesToRun.join(' or ')}`)
  }

  // spawnSync will automatically quote any args with spaces in them, so we don't need to
  // manually include the quotes when running the command. Here we do it for display purposes.
  const quotedArgs = args.map((arg) => (arg.includes(' ') ? `'${arg}'` : arg))
  log.stderr(`Running tests with pytest using command: ${[executable, ...quotedArgs].join(' ')}`)

  const { status } = await runCommand(executable, args)
  return { exitCode: status ?? 1 }
}
