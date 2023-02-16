// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'
import { ProtocolLogger, NowType } from '../src/ProtocolLogger'
import { vol } from 'memfs'

jest.mock('../src/log')
jest.mock('fs')

describe('ProtocolLogger', () => {
  let logger: ProtocolLogger
  let mockNow: NowType

  beforeEach(() => {
    vol.reset()

    mockNow = (() => {
      let count = 1
      return () => count++
    })()

    logger = new ProtocolLogger(mockNow)
  })

  it('writes the log file correctly', async () => {
    vol.fromJSON({}, '.')

    const logFileName = path.join('some', 'dir', 'llamas.json')

    logger.setLogFileName(logFileName)
    logger.logProtocolReadStart()
    logger.logProtocolReadEnd()
    logger.logDiscoveredProtocolEnvVars({ llamas: 'Larger than frogs' })
    logger.logAdapterLoadStart()
    logger.logAdapterPath('some/cool/adapter')
    logger.logAdapterLoadEnd()
    logger.logTestRunStart()
    logger.logTestRunEnd()
    logger.logError('some informative error message')

    const result = await logger.write()

    expect(vol.readFileSync(logFileName, 'utf-8')).toBe(result)
    expect(logger.getLogFileName()).toBe(logFileName)
    expect(JSON.parse(result)).toMatchSnapshot()
  })
})
