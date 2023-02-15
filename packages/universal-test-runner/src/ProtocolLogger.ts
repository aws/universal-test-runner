// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fileSystem from 'fs/promises'
import path from 'path'
import { log } from './log'

type LogEntryType =
  | 'MESSAGE'
  | 'CUSTOM'
  | 'PROTOCOL_READ_START'
  | 'PROTOCOL_READ_END'
  | 'DISCOVERED_PROTOCOL_ENV_VARS'
  | 'TEST_RUN_START'
  | 'TEST_RUN_END'
  | 'PROTOCOL_VERSION'

type CustomLogEntryType = 'ADAPTER_LOAD_START' | 'ADAPTER_LOAD_END' | 'ADAPTER_PATH'

type LogLevel = 'INFO' | 'ERROR' | 'DEBUG' | 'WARN'

interface LogEntry {
  timestamp: number
  type: LogEntryType
  level: LogLevel
  data: any
}

export type FsType = Pick<typeof fileSystem, 'writeFile' | 'access' | 'mkdir'>
export type NowType = () => number

export class ProtocolLogger {
  private now: NowType
  private fs: FsType
  private logs: LogEntry[]
  private logFileName?: string

  constructor(now: NowType = () => Date.now(), fs: FsType = fileSystem) {
    this.now = now
    this.fs = fs
    this.logs = []
    this.logFileName = undefined
  }

  setLogFileName(logFileName?: string) {
    this.logFileName = logFileName
  }

  getLogFileName(): string | undefined {
    return this.logFileName
  }

  private log(type: LogEntryType, level: LogLevel, data: any) {
    this.logs.push({
      timestamp: this.now(),
      level,
      type,
      data,
    })
  }

  private logCustom(type: CustomLogEntryType, data: any) {
    this.log('CUSTOM', 'DEBUG', {
      type,
      data,
    })
  }

  logProtocolReadStart() {
    this.log('PROTOCOL_READ_START', 'INFO', undefined)
  }

  logProtocolReadEnd() {
    this.log('PROTOCOL_READ_END', 'INFO', undefined)
  }

  logTestRunStart() {
    this.log('TEST_RUN_START', 'INFO', undefined)
  }

  logTestRunEnd() {
    this.log('TEST_RUN_END', 'INFO', undefined)
  }

  logDiscoveredProtocolEnvVars(envVars: { [key: string]: string }) {
    this.log('DISCOVERED_PROTOCOL_ENV_VARS', 'DEBUG', envVars)
  }

  logProtocolVersion(version: string) {
    this.log('PROTOCOL_VERSION', 'DEBUG', version)
  }

  logError(message: string) {
    this.log('MESSAGE', 'ERROR', message)
  }

  logAdapterLoadStart() {
    this.logCustom('ADAPTER_LOAD_START', undefined)
  }

  logAdapterLoadEnd() {
    this.logCustom('ADAPTER_LOAD_END', undefined)
  }

  logAdapterPath(framework: string) {
    this.logCustom('ADAPTER_PATH', framework)
  }

  async write(): Promise<string> {
    if (!this.logFileName) {
      return ''
    }

    const logFileDir = path.dirname(this.logFileName)
    try {
      await this.fs.access(logFileDir)
    } catch (e) {
      await this.fs.mkdir(logFileDir, { recursive: true })
    }

    const loggingJson = JSON.stringify({ logs: this.logs }, null, 2)

    await this.fs.writeFile(this.logFileName, loggingJson)

    log.info('Wrote logging information to', this.logFileName)

    return loggingJson
  }
}
