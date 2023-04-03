// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel } from '@aws/universal-test-runner-types'

import { makeLogger, LoggingMethods, shouldLog } from '../src/index'

describe('Logger', () => {
  it.each(['error', 'info', 'debug', 'warn'] as (keyof LoggingMethods)[])(
    'adds the log prefix to the %s method',
    (methodName) => {
      const method = jest.fn()
      const logger = makeLogger('my-cool-prefix:', { [methodName]: method })
      logger.setLogLevel('debug')

      logger[methodName]('what', 'is', 'up')

      expect(method).toHaveBeenCalledWith('my-cool-prefix:', 'what', 'is', 'up')
    },
  )

  describe.each(['debug', 'info', 'warn', 'error'] as LogLevel[])(
    'with log level %s',
    (logLevel) => {
      it.each(['debug', 'info', 'warn', 'error'] as (keyof LoggingMethods)[])(
        'calls the %s method if needed',
        (methodName) => {
          const method = jest.fn()
          const logger = makeLogger('', { [methodName]: method })
          logger.setLogLevel(logLevel)

          logger[methodName]()

          const called = method.mock.calls.length > 0

          expect(called).toEqual(shouldLog(methodName, logLevel))
        },
      )
    },
  )
})
