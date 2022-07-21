// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

interface Logger {
  stderr(...args: any[]): void
}

class CodeAwsTestAdapterGradleLogger implements Logger {
  stderr(...args: any[]): void {
    console.error('[codeaws-test-adapter-gradle]:', ...args)
  }
}

export default new CodeAwsTestAdapterGradleLogger()
