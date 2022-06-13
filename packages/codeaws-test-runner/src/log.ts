/* eslint-disable no-console */

interface Logger {
  stderr(...args: any[]): void
}

function prefix(fn: (...args: any[]) => void) {
  return (...args: any[]): void => {
    fn('[codeaws-test-runner]:', ...args)
  }
}

const logger: Logger = {
  stderr: prefix(console.error),
}

export default logger
