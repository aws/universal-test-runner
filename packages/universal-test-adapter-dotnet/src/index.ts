// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'

// Transforms filepath input from 'folderA/folderB/file.java' to 'folderA.folderB' if filepath contains suiteName
// and to 'folderA.folderB.file' if suiteName DNE
export const parsePackagePath = (filepath: string, suiteName: string | undefined): string => {
  if (suiteName && filepath.includes(suiteName)) {
    return filepath.substring(0, filepath.indexOf(suiteName) - 1).replace(/\/|\\/g, '.')
  }
  const fileExtensionIndex = filepath.lastIndexOf('.')
  if (fileExtensionIndex != -1) {
    filepath = filepath.substring(0, fileExtensionIndex)
  }
  return filepath.replace(/\/|\\/g, '.')
}

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
