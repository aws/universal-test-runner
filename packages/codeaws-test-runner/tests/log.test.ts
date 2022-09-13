// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeLogger } from '../src/log'

describe('Logger', () => {
  it('adds the log prefix to the info method', () => {
    const info = jest.fn()
    const logger = makeLogger({ info }, 'my-cool-prefix:')
    logger.info('what', 'is', 'up')
    expect(info).toHaveBeenCalledWith('my-cool-prefix:', 'what', 'is', 'up')
  })
})
