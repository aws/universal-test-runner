/* eslint-disable no-console */

interface Logger {
  stderr(...args: any[]): void
}

class CodeAwsTestAdapterMavenLogger implements Logger {
  stderr(...args: any[]): void {
    console.error('[codeaws-test-adapter-maven]:', ...args)
  }
}

export default new CodeAwsTestAdapterMavenLogger()
