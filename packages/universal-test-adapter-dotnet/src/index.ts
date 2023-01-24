// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'

// Transforms filepath input from 'folderA/folderB/file.java' to 'folderA.folderB' if suiteName is passed
// and to 'folderA.folderB.file' if suiteName DNE
export const parsePackagePath = (filepath: string, suiteName: string | undefined): string => {
  if (suiteName) {
    if (filepath.includes(suiteName)) {
      return filepath.substring(0, filepath.indexOf(suiteName) - 1).replace(/\/|\\/g, '.')
    }
  }
  if (filepath.lastIndexOf('.') != -1) {
    return filepath.substring(0, filepath.lastIndexOf('.')).replace(/\/|\\/g, '.')
  }
  return filepath.replace(/\/|\\/g, '.')
}

// only supports when file name is passed into filePath, this is in our requirements
// checking for suiteName in parsePackagePath may be redundant, this covers the case where FileName != ClassName, not sure if its possible
export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const executable = 'dotnet'
  const args = ['test']
  const fullyQualifiedNames = testsToRun.map(({ testName, suiteName, filepath }) => {
    //Search the AND of the 2, since FullyQualifiedName~ is a contains
    //avoid the replace at the end if possible, prob a bit expensive
    return `(FullyQualifiedName~${filepath ? parsePackagePath(filepath, suiteName) + '.' : ''}.${
      suiteName ? suiteName + '.' : ''
    }.${testName})`.replace(/\.+/g, '.')
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
