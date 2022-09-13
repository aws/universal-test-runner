// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

type LogHandler = (...args: any[]) => void

interface Logger {
  info: LogHandler
}

function prefix(fn: LogHandler, prefixString: string): LogHandler {
  return (...args: any[]): void => {
    fn(prefixString, ...args)
  }
}

export function makeLogger(methods: Logger, prefixString: string): Logger {
  return {
    info: prefix(methods.info, prefixString),
  }
}

const LOG_PREFIX = '[codeaws-test-runner]:'

export default makeLogger(
  {
    info: console.error,
  },
  LOG_PREFIX,
)
