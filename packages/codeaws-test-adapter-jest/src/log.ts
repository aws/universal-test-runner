// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

interface Logger {
  stderr(...args: any[]): void
}

class CodeAwsTestAdapterJestLogger implements Logger {
  stderr(...args: any[]): void {
    console.error('[codeaws-test-adapter-jest]:', ...args)
  }
}

export default new CodeAwsTestAdapterJestLogger()
