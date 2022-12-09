// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runCommand } from './runCommand'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@sentinel-internal/universal-test-runner-types'

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'pytest'
  const args = []
  let useKFlag = false
  const testNamesToRun = testsToRun.map(({ testName, suiteName, filepath }) => {
    if (testName && suiteName && filepath) {
      return `${filepath}::${suiteName}::${testName}`
    }
    !useKFlag &&
      log.info(
        'Found test entry without both of filepath or suiteName, this will match a contains on the provided information',
      )
    useKFlag = true
    return (
      '(' +
      (filepath ? filepath + ' and ' : '') +
      (suiteName ? suiteName + ' and ' : '') +
      testName +
      ')'
    )
  })

  if (testNamesToRun.length > 0) {
    useKFlag
      ? args.push('-k', `${testNamesToRun.join(' or ')}`)
      : args.push('-v', `${testNamesToRun.join(' ')}`)
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
