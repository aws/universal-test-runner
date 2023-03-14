// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface TestCase {
  testName: string
  suiteName?: string
  filepath?: string
}

export interface AdapterInput {
  testsToRun?: TestCase[]
  reportFormat?: string
}

export interface AdapterOutput {
  exitCode?: number | null
}

export interface Adapter {
  executeTests(options: AdapterInput): Promise<AdapterOutput> | AdapterOutput
}

export interface ProtocolResult {
  version: string
  testsToRun?: string
  logFileName?: string
  reportFormat?: string
  testsToRunFile?: string
}
