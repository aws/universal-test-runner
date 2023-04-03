// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput, RunnerContext } from '@aws/universal-test-runner-types'

// not safe for windows, need to handle backslashes
// Transforms filepath input from 'folderA/folderB/file.java' to 'folderA.folderB'
export const parsePackagePath = (filepath: string): string => {
  const newFilepath = filepath.replace(/\\/g, '/')
  return newFilepath.substring(0, filepath.lastIndexOf('/')).replace(/\//g, '.')
}

export async function executeTests(
  { testsToRun = [] }: AdapterInput,
  context?: RunnerContext,
): Promise<AdapterOutput> {
  context && log.setLogLevel(context.logLevel)

  const executable = 'gradle'
  const args = ['test']
  const testNamesToRun = testsToRun.map(({ testName, suiteName, filepath }) => {
    // *packagePath.suiteName.testName
    return `*${filepath ? parsePackagePath(filepath) : ''}.${suiteName || '*'}.${testName}`
  })
  if (testNamesToRun.length > 0) {
    args.push(
      ...testNamesToRun.flatMap((fullyQualifiedName) => ['--tests', `${fullyQualifiedName}`]),
    )
  }
  log.info(`Running tests with gradle using command: ${[executable, ...args].join(' ')}`)
  const { status, error } = await spawn(executable, args)
  if (error) {
    log.error(error)
  }
  return { exitCode: status ?? 1 }
}
