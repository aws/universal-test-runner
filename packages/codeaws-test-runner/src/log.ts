// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

type LogHandler = (...args: any[]) => void

interface Logger {
  stderr: LogHandler
}

function prefix(fn: LogHandler, prefixString: string): LogHandler {
  return (...args: any[]): void => {
    fn(prefixString, ...args)
  }
}

export function makeLogger(methods: Logger, prefixString: string): Logger {
  return {
    stderr: prefix(methods.stderr, prefixString),
  }
}

const LOG_PREFIX = '[codeaws-test-runner]:'

export default makeLogger(
  {
    stderr: console.error,
  },
  LOG_PREFIX,
)
