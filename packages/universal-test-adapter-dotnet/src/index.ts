// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'
import path from 'path'

// Transforms filepath input from 'folderA/folderB/file.java' to 'folderA.folderB' if filepath contains suiteName
// and to 'folderA.folderB.file' if suiteName DNE
export const parseFilepathAndClassName = (
  filepath: string | undefined,
  suiteName: string | undefined,
): string => {
  if (!filepath) {
    return '.' + suiteName || ''
  }

  const parsedPath = path.parse(filepath)
  if (suiteName && parsedPath.name !== suiteName) {
    filepath = `${parsedPath.dir ? parsedPath.dir + '.' : ''}${parsedPath.name}.${suiteName}`
  } else {
    filepath = `${parsedPath.dir ? parsedPath.dir + '.' : ''}${parsedPath.name}`
  }

  filepath = filepath.replace(/\/+|\\+/g, '.')
  if (filepath.endsWith('.')) {
    return filepath.substring(0, filepath.length - 1)
  }
  return filepath
}

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'dotnet'
  const args = ['test']
  const fullyQualifiedNames = testsToRun.map(({ testName, suiteName, filepath }) => {
    //Search the AND of the 2, since FullyQualifiedName~ is a contains
    if (!suiteName) {
      return (
        '(' +
        (filepath
          ? `FullyQualifiedName~${parseFilepathAndClassName(filepath, suiteName)} & `
          : '') +
        `FullyQualifiedName~.${testName})`
      )
    }
    return `(FullyQualifiedName~${parseFilepathAndClassName(filepath, suiteName)}.${testName})`
  })
  if (fullyQualifiedNames.length > 0) {
    args.push(`--filter`)
    args.push(`${fullyQualifiedNames.join(' | ')}`)
  }
  log.info(`Running tests with dotnet test using command: ${[executable, ...args].join(' ')}`)
  const { status, error } = await spawn(executable, args)
  if (error) {
    log.error(error)
  }
  return { exitCode: status ?? 1 }
}
