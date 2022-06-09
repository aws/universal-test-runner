/* eslint-disable no-console */

interface Logger {
  stderr(...args: any[]): void
}

class CodeAwsTestRunnerLogger implements Logger {
  stderr(...args: any[]): void {
    console.error('[codeaws-test-runner]:', ...args)
  }
}

export default new CodeAwsTestRunnerLogger()
