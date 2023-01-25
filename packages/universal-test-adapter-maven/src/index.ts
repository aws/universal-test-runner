// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'

import path from 'path'

// Duplicated code, need to move into a utils packages
const toUnixPath = (filepath: string): string => {
  // https://quickref.me/convert-a-windows-file-path-to-unix-path
  return filepath.replace(/[\\/]+/g, '/').replace(/^([a-zA-Z]+:|\.\/)/, '')
}

// mvn expects the format $PATH_TO_FILE/$CLASS_NAME#$TEST_NAME
export const parseFilepathAndClassName = (
  filepath: string | undefined,
  suiteName: string | undefined,
): string => {
  if (!filepath) {
    return suiteName || ''
  }

  const parsedPath = path.parse(filepath)
  filepath = `${parsedPath.dir ? parsedPath.dir + '/' : ''}${parsedPath.name}`
  if (suiteName) {
    if (parsedPath.name != suiteName) {
      filepath = filepath + '/' + suiteName
    }
  }

  return toUnixPath(filepath)
}

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'mvn'
  const args = []

  if (testsToRun.length > 0) {
    args.push(
      `-Dtest=${testsToRun
        .map(({ testName, suiteName, filepath }) => {
          const parsedFilepath = parseFilepathAndClassName(filepath, suiteName)
          return parsedFilepath + '#' + testName
        })
        .join(',')}`,
    )
  }
  args.push('test')
  log.info(`Running tests with maven using command: ${[executable, ...args].join(' ')}`)
  const { status, error } = await spawn(executable, args)
  if (error) {
    log.error(error)
  }
  return { exitCode: status ?? 1 }
}
