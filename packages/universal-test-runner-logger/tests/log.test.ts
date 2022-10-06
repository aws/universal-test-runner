// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import makeLogger, { Logger } from '../src/index'

describe('Logger', () => {
  it.each(['error', 'info', 'debug', 'warn'] as (keyof Logger)[])(
    'adds the log prefix to the %s method',
    (methodName) => {
      const method = jest.fn()
      const logger = makeLogger('my-cool-prefix:', { [methodName]: method })
      logger[methodName]('what', 'is', 'up')
      expect(method).toHaveBeenCalledWith('my-cool-prefix:', 'what', 'is', 'up')
    },
  )
})
