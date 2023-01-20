// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawn } from '@aws/universal-test-runner-spawn'
import { log } from './log'
import { buildBaseTestCommand } from './buildBaseTestCommand'

import { AdapterInput, AdapterOutput } from '@aws/universal-test-runner-types'

// could also use https://www.npmjs.com/package/path-to-glob-pattern?activeTab=explore
// Examples:
// src/dirA/dirB/file.js -> **/src/dirA/dirB/file.js
// src\dirA\.*\dirB -> **/src/dirA/**/dirB/**
const pathToGlob = (filepath: string): string => {
  //should do this different to avoid 2 linear searches
  filepath = filepath.replace(/\\/g, '/').replace(/\.\*/g, '**')

  filepath = !filepath.startsWith('**')
    ? filepath.startsWith('/')
      ? '**' + filepath
      : '**/' + filepath
    : filepath

  // no file specified, only dirs
  if (!filepath.includes('.')) {
    if (!filepath.endsWith('**')) {
      // src/dirA/dirB
      if (!filepath.endsWith('/')) {
        filepath = filepath + '/**'
      }
      // src/dirA/dirB/
      else {
        filepath = filepath + '**'
      }
    }
  }
  return filepath
}

export async function executeTests({ testsToRun = [] }: AdapterInput): Promise<AdapterOutput> {
  const [executable, args] = await buildBaseTestCommand()
  // const executable = 'jest'
  // const args = []

  const filepaths: string[] = []
  const describeIts: string[] = []

  let filepathWithTestOrSuiteCount = 0

  testsToRun.forEach(({ testName, suiteName, filepath }) => {
    if (filepath && (testName || suiteName)) {
      filepathWithTestOrSuiteCount++
    }
    filepath && filepaths.push(`(${pathToGlob(filepath)})`)
    if (suiteName && testName) {
      describeIts.push(`(${suiteName} ${testName})`)
    } else {
      suiteName ? describeIts.push(`(${suiteName})`) : describeIts.push(`(${testName})`)
    }
  })

  // since we can't map test names/suites to a filepath for jest, we cannot include filepaths in this call
  if (filepaths.length > 0) {
    if (describeIts.length == 0 || filepathWithTestOrSuiteCount == describeIts.length) {
      args.push('--testMatch', `${filepaths.join('|')}`)
    } else if (filepathWithTestOrSuiteCount != describeIts.length) {
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

  log.info(`Running tests with jest using command: ${[executable, ...args].join(' ')}`)

  const { status, error } = await spawn(executable, args)

  if (error) {
    log.error(error)
  }

  return { exitCode: status ?? 1 }
}
