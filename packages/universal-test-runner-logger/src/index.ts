// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import chalk from 'chalk'

type LogHandler = (...args: any[]) => void

export interface Logger {
  info: LogHandler
  error: LogHandler
  debug: LogHandler
  warn: LogHandler
}

function prefix(fn: LogHandler, prefixString: string): LogHandler {
  return (...args): void => {
    fn(prefixString, ...args)
  }
}

/* eslint-disable no-console */
const defaultMethods: Logger = {
  info: (...args) => console.error(chalk.blueBright('[INFO]'), ...args),
  error: (...args) => console.error(chalk.redBright('[ERROR]'), ...args),
  warn: (...args) => console.error(chalk.yellowBright('[WARN]'), ...args),
  debug: (...args) => console.error('[DEBUG]', ...args),
}
/* eslint-enable no-console */

export default function makeLogger(
  prefixString: string,
  overrides: Partial<Logger> = defaultMethods,
): Logger {
  const methods = {
    ...defaultMethods,
    ...overrides,
  }
  return {
    info: prefix(methods.info, prefixString),
    error: prefix(methods.error, prefixString),
    warn: prefix(methods.warn, prefixString),
    debug: prefix(methods.debug, prefixString),
  }
}
