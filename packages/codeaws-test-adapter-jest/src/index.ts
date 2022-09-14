// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import runCommand from './runCommand'
import log from './log'
import buildBaseTestCommand from './buildBaseTestCommand'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/codeaws-test-runner-types'

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const [executable, args] = await buildBaseTestCommand()
  const testNamesToRun = testsToRun.map(({ testName }) => testName)
  if (testNamesToRun.length > 0) {
    args.push('--testNamePattern', testNamesToRun.join('|'))
  }
  log.info(`Running tests with jest using command: ${[executable, ...args].join(' ')}`)
  const { status } = await runCommand(executable, args)
  return { exitCode: status ?? 1 }
}
