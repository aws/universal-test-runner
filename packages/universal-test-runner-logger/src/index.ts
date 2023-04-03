// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import chalk from 'chalk'

import { LogLevel } from '@aws/universal-test-runner-types'

type LogHandler = (...args: any[]) => void

export interface LoggingMethods {
  debug: LogHandler
  info: LogHandler
  warn: LogHandler
  error: LogHandler
}

const LogLevelRanks: { [key in LogLevel]: number } = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
} as const

export function shouldLog(methodName: keyof LoggingMethods, logLevel: LogLevel): boolean {
  return LogLevelRanks[methodName] >= LogLevelRanks[logLevel]
}

export interface Logger extends LoggingMethods {
  setLogLevel: (level: LogLevel) => void
}

function prefix(fn: LogHandler, prefixString: string): LogHandler {
  return (...args): void => {
    fn(prefixString, ...args)
  }
}

/* eslint-disable no-console */
const defaultMethods: LoggingMethods = {
  info: (...args) => console.error(chalk.blueBright('[INFO]'), ...args),
  error: (...args) => console.error(chalk.redBright('[ERROR]'), ...args),
  warn: (...args) => console.error(chalk.yellowBright('[WARN]'), ...args),
  debug: (...args) => console.error('[DEBUG]', ...args),
}
/* eslint-enable no-console */

export function makeLogger(
  prefixString: string,
  overrides: Partial<LoggingMethods> = defaultMethods,
): Logger {
  const methods = {
    ...defaultMethods,
    ...overrides,
  }

  let logLevel: LogLevel = 'info'

  return {
    setLogLevel: (_logLevel) => {
      logLevel = _logLevel
    },
    ...(['debug', 'info', 'warn', 'error'] as const).reduce(
      (loggingMethods, methodName) => ({
        ...loggingMethods,
        [methodName]: (...args: any[]) => {
          shouldLog(methodName, logLevel) && prefix(methods[methodName], prefixString)(...args)
        },
      }),
      {} as LoggingMethods,
    ),
  }
}
