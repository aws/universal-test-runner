// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import mapEnvToResult, { Environment } from './mapEnvToResult'
import log from './log'
import { ProtocolEnvVars } from './ProtocolEnvVars'

interface TestCase {
  testName: string
  suiteName?: string
  filepath?: string
}

export interface ProtocolResult {
  version: string
  testsToRun: TestCase[]
  testReportFormat?: string
  testReportOutputDir?: string
  testReportFileName?: string
  logFileName?: string
}

function readProtocol(env: Environment): [ProtocolResult, { [key: string]: string }] {
  const rawValues = {}
  const result = {
    version: mapEnvToResult(env, [ProtocolEnvVars.VERSION], readVersion, rawValues),
    testsToRun: mapEnvToResult(
      env,
      [
        ProtocolEnvVars.TESTS_TO_RUN,
        // Keeping this old name around for now, for backwards compatibility
        'CAWS_TEST_NAMES_TO_RUN',
      ],
      readTestsToRun,
      rawValues,
    ),
    testReportFormat: mapEnvToResult(
      env,
      [ProtocolEnvVars.TEST_REPORT_FORMAT],
      readTestReportFormat,
      rawValues,
    ),
    testReportOutputDir: mapEnvToResult(
      env,
      [ProtocolEnvVars.TEST_REPORT_OUTPUT_DIR],
      readTestReportOutputDir,
      rawValues,
    ),
    testReportFileName: mapEnvToResult(
      env,
      [ProtocolEnvVars.TEST_REPORT_FILE_NAME],
      readTestReportFileName,
      rawValues,
    ),
    logFileName: mapEnvToResult(env, [ProtocolEnvVars.LOG_FILE_NAME], readLogFileName, rawValues),
  }
  return [result, rawValues]
}

function readVersion(input: string | undefined): string {
  const DEFAULT_VERSION = '0.1.0'

  if (!input) {
    log.warn('Protocol version not specified! Defaulting to', DEFAULT_VERSION)
  }

  return input ?? DEFAULT_VERSION
}

function readTestsToRun(input: string | undefined): TestCase[] {
  const TEST_CASE_SEPARATOR = '|'
  const TEST_LOCATION_SEPARATOR = '#'

  return (
    input?.split(TEST_CASE_SEPARATOR).map((testCase) => {
      const [testName, suiteName, filepath] = testCase.split(TEST_LOCATION_SEPARATOR).reverse()
      return {
        testName,
        suiteName: suiteName || undefined,
        filepath: filepath || undefined,
      }
    }) ?? []
  )
}

function readTestReportFormat(testReportFormat: string | undefined): string | undefined {
  const VALID_REPORT_FORMATS = ['junitxml']

  if (testReportFormat && !VALID_REPORT_FORMATS.includes(testReportFormat.toLowerCase())) {
    throw new Error(`Report format ${testReportFormat} not supported!`)
  }

  return testReportFormat?.toLowerCase()
}

function readTestReportOutputDir(testReportOutputDir: string | undefined): string | undefined {
  return testReportOutputDir
}

function readTestReportFileName(testReportFileName: string | undefined): string | undefined {
  return testReportFileName
}

function readLogFileName(logFileName: string | undefined): string | undefined {
  return logFileName
}

export default readProtocol
