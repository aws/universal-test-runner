// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runCommand } from './runCommand'
import { log } from './log'
import { buildBaseTestCommand } from './buildBaseTestCommand'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/universal-test-runner-types'

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const [executable, args] = await buildBaseTestCommand()

  const testNamesToRun = testsToRun.map(({ testName }) => testName)

  if (testNamesToRun.length > 0) {
    args.push('--testNamePattern', testNamesToRun.join('|'))
  }

  const extraEnvVars: { [key: string]: string } = {}

  const envVarStrings = Object.entries(extraEnvVars).map(([key, value]) => `${key}="${value}"`)

  log.info(
    `Running tests with jest using command: ${[...envVarStrings, executable, ...args].join(' ')}`,
  )

  const { status } = await runCommand(executable, args, extraEnvVars)
  return { exitCode: status ?? 1 }
}
