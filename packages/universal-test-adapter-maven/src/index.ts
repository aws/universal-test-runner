// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'

// mvn expects the format $PATH_TO_FILE/$CLASS_NAME#$TEST_NAME
// will fail to find the test if suiteName is not passed, or if filepath does not include the name of the file (can't pass a subdir that does not include the filename)
export const parseFilepathAndClassName = (
  filepath: string | undefined,
  suiteName: string | undefined,
): string => {
  if (!filepath) {
    return ''
  }

  let newFilepath = filepath

  if (!suiteName) {
    const fileExtensionIndex = filepath.lastIndexOf('.')
    if (fileExtensionIndex != -1) {
      newFilepath = filepath.substring(0, filepath.indexOf('.'))
    }
  } else {
    const indexOfSuiteName = filepath.indexOf(suiteName)
    if (indexOfSuiteName != -1) {
      newFilepath = filepath.substring(0, indexOfSuiteName)
    } else {
      if (!newFilepath.endsWith('/') || !newFilepath.endsWith('\\')) {
        newFilepath = newFilepath + '/'
      }
    }
  }

  return newFilepath.replace(/\\/g, '/')
}

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'mvn'
  const args = []

  if (testsToRun.length > 0) {
    args.push(
      `-Dtest=${testsToRun
        .map(({ testName, suiteName, filepath }) => {
          const parsedFilepath = parseFilepathAndClassName(filepath, suiteName)
          return parsedFilepath + (suiteName ? suiteName + '#' : '#') + testName
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
