// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'
import { runCommand } from './runCommand'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/universal-test-runner-types'

export async function executeTests({
  testsToRun = [],
  testReportFormat,
  testReportOutputDir,
  testReportFileName,
}: AdapterInput): Promise<AdapterOutput> {
  const executable = 'pytest'
  const args = []
  const testNamesToRun = testsToRun.map(({ testName }) => testName)
  if (testNamesToRun.length > 0) {
    args.push('-k', `${testNamesToRun.join(' or ')}`)
  }

  if (testReportFormat) {
    if (testReportFormat === 'junitxml') {
      args.push(
        `--junitxml=${path.join(testReportOutputDir ?? '', testReportFileName ?? 'junit.xml')}`,
      )
    } else {
      log.warn(`Report format ${testReportFormat} not supported`)
    }
  }

  // spawnSync will automatically quote any args with spaces in them, so we don't need to
  // manually include the quotes when running the command. Here we do it for display purposes.
  const quotedArgs = args.map((arg) => (arg.includes(' ') ? `'${arg}'` : arg))
  log.info(`Running tests with pytest using command: ${[executable, ...quotedArgs].join(' ')}`)

  const { status, error } = await runCommand(executable, args)

  if (error) {
    log.error(error)
  }

  return { exitCode: status ?? 1 }
}
