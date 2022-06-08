/* eslint-disable no-console */

export function stderr(...args: any[]) {
  console.error(`[codeaws-test-runner]: ${args.map(String).join(' ')}`)
}
