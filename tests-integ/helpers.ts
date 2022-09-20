// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { XMLParser } from 'fast-xml-parser'

export function runSetupScript(adapter: string) {
  runScript(adapter, 'setup.sh')
}

export function runCli(adapter: string, env: { [key: string]: string }) {
  // For some reason the executables don't get put into node_modules/.bin
  // when running in GitHub actions, so we us the JS file directly
  const EXECUTABLE = path.resolve(
    __dirname,
    '..',
    'packages',
    'codeaws-test-runner',
    'dist',
    'lib',
    'bin',
    'cli.js',
  )

  runScript(adapter, 'run.sh', {
    ...env,
    RUN_TESTS: ['node', EXECUTABLE].join(' '),
  })
}

export function parseJunitReport(adapter: string, reportPath: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: 'attr_',
    attributeValueProcessor: (attr, val) => {
      const toMock = ['timestamp', 'time', 'hostname']
      if (toMock.includes(attr)) {
        return 'MOCK_VALUE'
      }
      return val
    },
  })

  const xml = fs.readFileSync(path.resolve(getCwd(adapter), reportPath), 'utf-8')
  return parser.parse(xml)
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

  if (status !== 0) {
    console.log(stdout?.toString())
    console.error(stderr?.toString())
    console.error(error)
    throw new Error(
      `Script ${scriptName} failed to execute for adapter ${adapter}, exit code is ${status}`,
    )
  }
}
