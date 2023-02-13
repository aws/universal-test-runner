// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'

export async function executeTests(input: AdapterInput): Promise<AdapterOutput> {
  const { testsToRun = [], reportFormat } = input

  const executable = 'pytest'
  const args = []

  const matchTestsDirectly = testsToRun.every(
    ({ testName, suiteName, filepath }) => testName && suiteName && filepath,
  )
  !matchTestsDirectly &&
    log.info(
      'Found test entry without both of filepath or suiteName, all test entries will match a contains on the provided information',
    )

  const testNamesToRun = testsToRun.map(({ testName, suiteName, filepath }) => {
    return matchTestsDirectly
      ? `${filepath}::${suiteName}::${testName}`
      : // Concats each filepath, suitName, testName by 'and' (ex. '(filepath and suiteName and testName)')
        '(' +
          (filepath ? filepath + ' and ' : '') +
          (suiteName ? suiteName + ' and ' : '') +
          testName +
          ')'
  })

  if (testNamesToRun.length > 0) {
    // https://docs.pytest.org/en/7.1.x/example/markers.html
    matchTestsDirectly
      ? args.push('-v', `${testNamesToRun.join(' ')}`)
      : args.push('-k', `${testNamesToRun.join(' or ')}`)
  }

  switch (reportFormat) {
    case 'default':
      args.push('--junitxml=junit.xml')
      break
    case undefined:
      break
    default:
      log.warn(`Report format ${reportFormat} not supported!`)
  }

  // spawnSync will automatically quote any args with spaces in them, so we don't need to
  // manually include the quotes when running the command. Here we do it for display purposes.
  const quotedArgs = args.map((arg) => (arg.includes(' ') ? `'${arg}'` : arg))
  log.info(`Running tests with pytest using command: ${[executable, ...quotedArgs].join(' ')}`)

  const { status, error } = await spawn(executable, args)

  if (error) {
    log.error(error)
  }

  return { exitCode: status ?? 1 }
}
