// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'
import { buildBaseTestCommand } from './buildBaseTestCommand'

import { AdapterInput, AdapterOutput, RunnerContext } from '@aws/universal-test-runner-types'

const toUnixPath = (filepath: string): string => {
  // https://quickref.me/convert-a-windows-file-path-to-unix-path
  return filepath.replace(/[\\/]+/g, '/').replace(/^([a-zA-Z]+:|\.\/)/, '')
}

export async function executeTests(
  adapterInput: AdapterInput,
  context: RunnerContext,
): Promise<AdapterOutput> {
  log.setLogLevel(context.logLevel)

  const { testsToRun = [], reportFormat } = adapterInput

  const [executable, args] = await buildBaseTestCommand()

  args.push(...context.extraArgs)

  const filepaths: string[] = []
  const describeIts: string[] = []

  let filepathWithTestOrSuiteCount = 0

  testsToRun.forEach(({ testName, suiteName, filepath }) => {
    if (filepath && (testName || suiteName)) {
      filepathWithTestOrSuiteCount++
    }
    filepath && filepaths.push(`(${toUnixPath(filepath)})`)
    if (suiteName && testName) {
      describeIts.push(`(${suiteName} ${testName})`)
    } else {
      suiteName ? describeIts.push(`(${suiteName})`) : describeIts.push(`(${testName})`)
    }
  })

  // since we can't map test names/suites to a filepath for jest, we cannot include filepaths in this call
  if (filepaths.length > 0) {
    if (describeIts.length === 0 || filepathWithTestOrSuiteCount === describeIts.length) {
      args.push('--testPathPattern', `${filepaths.join('|')}`)
    } else if (filepathWithTestOrSuiteCount !== describeIts.length) {
      log.warn(
        'Detected entry that includes a filepath but does not include a test suite/name! ' +
          'This is not supported since jest cannot map files to tests as input, ' +
          'please either remove all references to filepaths or include it in all entries',
      )
    }
  }
  if (describeIts.length > 0) {
    args.push('--testNamePattern', `${describeIts.join('|')}`)
  }

  switch (reportFormat) {
    case 'default':
      // Pass the 'jest-junit' reporter so that jest generates a junit report
      args.push('--reporters', 'jest-junit')
      // Pass the 'default' reporter as well so jest still shows console output
      // Note that this is a different 'default' from the reportFormat 'default' from TEP
      args.push('--reporters', 'default')
      break
    case undefined:
      break
    default:
      log.warn(`Report format '${reportFormat} not supported!'`)
  }

  log.info(`Running tests with jest using command: ${[executable, ...args].join(' ')}`)

  const { status, error } = await spawn(executable, args)

  if (error) {
    log.error(error)
  }

  return { exitCode: status ?? 1 }
}
