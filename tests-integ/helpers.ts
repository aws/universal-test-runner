// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'

export function runSetupScript(adapter: string) {
  return runScript(adapter, 'setup.sh')
}

export function runCli(adapter: string, env: { [key: string]: string }) {
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

export function parseLogFile(adapter: string, logFileName: string) {
  const logs = JSON.parse(fs.readFileSync(path.resolve(getCwd(adapter), logFileName), 'utf-8'))
  logs.logs.forEach((log: any) => {
    log.timestamp = 'MOCK_VALUE'
  })
  return logs
}

export async function parseTestsToRun(adapter: string) {
  try {
    const config = await import(path.resolve(getCwd(adapter), 'config.json'))
    if (config && config.testsToRun) {
      return config.testsToRun
    }
  } catch (e: any) {
    // expect MODULE_NOT_FOUND if config file doesnt exist
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    }
  }
  return undefined
}

export async function parseTestsToRunWithFileAndSuite(adapter: string) {
  try {
    const config = await import(path.resolve(getCwd(adapter), 'config.json'))
    if (config && config.testsToRunWithFileAndSuite) {
      return config.testsToRunWithFileAndSuite
    }
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
