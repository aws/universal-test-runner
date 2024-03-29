// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'

export function runSetupScript(adapter: string) {
  return runScript(adapter, 'setup.sh')
}

export function runCli(adapter: string, env: { [key: string]: string | undefined }) {
  // For some reason the executables don't get put into node_modules/.bin
  // when running in GitHub actions, so we us the JS file directly
  const EXECUTABLE = path.resolve(
    __dirname,
    '..',
    'packages',
    'universal-test-runner',
    'dist',
    'lib',
    'bin',
    'cli.js',
  )

  return runScript(adapter, 'run.sh', {
    ...env,
    RUN_TESTS: ['node', EXECUTABLE].join(' '),
  })
}

export function readFile(adapter: string, fileName: string): string {
  return fs.readFileSync(path.resolve(getCwd(adapter), fileName), 'utf-8')
}

export function parseLogFile(adapter: string, logFileName: string) {
  const logs = JSON.parse(readFile(adapter, logFileName))
  logs.logs.forEach((log: any) => {
    log.timestamp = 'MOCK_VALUE'
  })
  return logs
}

export type IntegTestConfig = {
  testsToRun: string[]
}

export async function parseConfig(adapter: string): Promise<IntegTestConfig | undefined> {
  try {
    const config = await import(path.resolve(getCwd(adapter), 'config.json'))
    return config
  } catch (e: any) {
    // expect MODULE_NOT_FOUND if config file doesnt exist
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    }
  }
  return undefined
}

export function remove(adapter: string, filepath: string) {
  if (!filepath) {
    throw new Error('filepath must not be empty')
  }

  fs.rmSync(path.resolve(getCwd(adapter), filepath), {
    force: true,
    recursive: true,
  })
}

function getCwd(adapter: string) {
  return path.resolve(__dirname, 'test-projects', adapter)
}

function runScript(adapter: string, scriptName: string, env: { [key: string]: string } = {}) {
  const { status, stdout, stderr, error } = spawnSync('bash', [scriptName], {
    cwd: getCwd(adapter),
    stdio: process.env.DEBUG ? 'inherit' : 'pipe',
    env: {
      ...process.env,
      ...env,
    },
  })

  console.debug(
    `cwd = ${getCwd(adapter)},
    adapter = ${adapter},
    scriptName = ${scriptName},
    env = ${JSON.stringify(env)}`,
  )

  if (status !== 0) {
    console.log(stdout?.toString())
    console.error(stderr?.toString())
    console.error(error)
    throw new Error(
      `Script ${scriptName} failed to execute for adapter ${adapter}, exit code is ${status}`,
    )
  }

  return { status }
}
