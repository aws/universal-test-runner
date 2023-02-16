// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapEnvToResult, Environment } from './mapEnvToResult'
import { log } from './log'
import { ProtocolEnvVars } from './ProtocolEnvVars'

export interface ProtocolResult {
  version: string
  testsToRun?: string
  logFileName?: string
  reportFormat?: string
  testsToRunFile?: string
}

export function readProtocol(env: Environment): [ProtocolResult, { [key: string]: string }] {
  const rawValues = {}
  const result = {
    version: mapEnvToResult(env, [ProtocolEnvVars.VERSION], readVersion, rawValues),
    testsToRun: mapEnvToResult(env, [ProtocolEnvVars.TESTS_TO_RUN], readTestsToRun, rawValues),
    logFileName: mapEnvToResult(env, [ProtocolEnvVars.LOG_FILE_NAME], readLogFileName, rawValues),
    reportFormat: mapEnvToResult(env, [ProtocolEnvVars.REPORT_FORMAT], readReportFormat, rawValues),
    testsToRunFile: mapEnvToResult(
      env,
      [ProtocolEnvVars.TESTS_TO_RUN_FILE],
      readTestsToRunFile,
      rawValues,
    ),
  }

  if (result.testsToRun && result.testsToRunFile) {
    log.warn(
      `${ProtocolEnvVars.TESTS_TO_RUN_FILE} will be preferred over ${ProtocolEnvVars.TESTS_TO_RUN}`,
    )
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

function readTestsToRun(input: string | undefined): string | undefined {
  return input || undefined
}

function readTestsToRunFile(filePath: string | undefined): string | undefined {
  return filePath || undefined
}

function readLogFileName(logFileName: string | undefined): string | undefined {
  return logFileName || undefined
}

function readReportFormat(reportFormat: string | undefined): string | undefined {
  return reportFormat || undefined
}
