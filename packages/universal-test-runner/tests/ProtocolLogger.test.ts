// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ProtocolLogger, FsType, NowType } from '../src/ProtocolLogger'

jest.mock('../src/log')

describe('ProtocolLogger', () => {
  let logger: ProtocolLogger
  let mockNow: NowType
  let mockFs: FsType

  beforeEach(() => {
    mockNow = (() => {
      let count = 1
      return () => count++
    })()

    mockFs = {
      writeFile: jest.fn(() => Promise.resolve()),
      mkdir: jest.fn<any, any, any>(),
      access: jest.fn(() => Promise.resolve()),
    }

    logger = new ProtocolLogger(mockNow, mockFs)
  })

  it('writes the log file correctly', async () => {
    logger.setLogFileName('llamas.json')
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

    expect(mockFs.writeFile).toHaveBeenCalledWith('llamas.json', result)

    expect(JSON.parse(result)).toMatchSnapshot()
  })
})
