// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

type LogHandler = (...args: any[]) => void

export interface Logger {
  info: LogHandler
  error: LogHandler
  debug: LogHandler
  warn: LogHandler
}

function prefix(fn: LogHandler, prefixString: string): LogHandler {
  return (...args: any[]): void => {
    fn(prefixString, ...args)
  }
}

const defaultMethods: Logger = {
  info: console.error,
  error: console.error,
  warn: console.error,
  debug: console.error,
}

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
