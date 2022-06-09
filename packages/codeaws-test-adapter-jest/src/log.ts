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
