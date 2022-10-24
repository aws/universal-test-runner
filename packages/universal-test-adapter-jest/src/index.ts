// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runCommand } from './runCommand'
import { log } from './log'
import { buildBaseTestCommand } from './buildBaseTestCommand'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/universal-test-runner-types'

export async function executeTests({
  testsToRun = [],
  testReportFormat,
  testReportOutputDir,
  testReportFileName,
}: AdapterInput): Promise<AdapterOutput> {
  const [executable, args] = await buildBaseTestCommand()

  const testNamesToRun = testsToRun.map(({ testName }) => testName)

  if (testNamesToRun.length > 0) {
    args.push('--testNamePattern', testNamesToRun.join('|'))
  }

  const extraEnvVars: { [key: string]: string } = {}

  if (testReportFormat) {
    if (testReportFormat === 'junitxml') {
      // Add default reporter so that we still display console output
      args.push('--reporters', 'default')
      // jest-junit must have been installed by the user
      args.push('--reporters', 'jest-junit')
      if (testReportOutputDir) {
        extraEnvVars.JEST_JUNIT_OUTPUT_DIR = testReportOutputDir
      }
      if (testReportFileName) {
        extraEnvVars.JEST_JUNIT_OUTPUT_NAME = testReportFileName
      }
    } else {
      log.warn(`Report format ${testReportFormat} not supported`)
    }
  }

  const envVarStrings = Object.entries(extraEnvVars).map(([key, value]) => `${key}="${value}"`)

  log.info(
    `Running tests with jest using command: ${[...envVarStrings, executable, ...args].join(' ')}`,
  )

  const { status } = await runCommand(executable, args, extraEnvVars)
  return { exitCode: status ?? 1 }
}
