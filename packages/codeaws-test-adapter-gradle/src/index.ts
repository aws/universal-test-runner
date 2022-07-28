// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import runCommand from './runCommand'
import log from './log'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/codeaws-test-runner'

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'gradle'
  const args = ['test']
  const testNamesToRun = testsToRun.map(({ testName }) => testName)
  if (testNamesToRun.length > 0) {
    args.push(...testNamesToRun.flatMap((testName) => ['--tests', `*${testName}`]))
  }
  log.stderr(`Running tests with gradle using command: ${[executable, ...args].join(' ')}`)
  const { status } = await runCommand(executable, args)
  return { exitCode: status ?? 1 }
}
