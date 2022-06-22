// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeLogger } from '../src/log'

describe('Logger', () => {
  it('adds the log prefix to the stderr method', () => {
    const stderr = jest.fn()
    const logger = makeLogger({ stderr }, 'my-cool-prefix:')
    logger.stderr('what', 'is', 'up')
    expect(stderr).toHaveBeenCalledWith('my-cool-prefix:', 'what', 'is', 'up')
  })
})
