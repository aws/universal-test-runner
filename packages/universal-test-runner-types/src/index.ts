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

type ExecuteTestsReturnValue = Promise<AdapterOutput> | AdapterOutput

export interface Adapter {
  executeTests(options: AdapterInput): ExecuteTestsReturnValue
  executeTests(options: AdapterInput, context: RunnerContext): ExecuteTestsReturnValue
}

export interface ProtocolResult {
  version: string
  testsToRun?: string
  logFileName?: string
  reportFormat?: string
  testsToRunFile?: string
}

export interface RunnerContext {
  extraArgs: string[]
  cwd: string
}
