// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'
import { access, readFile } from 'fs/promises'
import log from './log'

/**
 * Start by determining what executable to use, then what args to pass to the executable.
 *
 * Executable:
 * - If the user has defined a package.json that we detect as executing jest in some way:
 *   - Assume that we'll run tests via their package manager
 *   - If a yarn.lock file is present, use `yarn` as our executable. Otherwise use `npm`
 * - Otherwise, use ./node_modules/.bin/jest as the executable if present
 * - Otherwise, use global jest
 *
 * Args:
 * - If we are invoking via package manager, use the script name as the first arg
 * - Add any jest-specific args required to run the tests according to what's passed by the runner
 */
export default async function buildBaseTestCommand(): Promise<[string, string[]]> {
  try {
    const packageJsonContents = await loadPackageJson()
    const packageJson = parsePackageJson(packageJsonContents)
    const testScriptName = pickTestScript(packageJson)
    return await buildPackageManagerTestCommand(testScriptName)
  } catch (e: any) {
    log.stderr(e.message)
    const jestExecutablePath = path.join('.', 'node_modules', '.bin', 'jest')
    const executable = (await exists(jestExecutablePath)) ? jestExecutablePath : 'jest'
    return [executable, []]
  }
}

async function loadPackageJson(): Promise<string> {
  try {
    return await readFile(path.resolve('.', 'package.json'), 'utf-8')
  } catch (e) {
    throw new Error('Unable to load package.json')
  }
}

interface PackageJson {
  scripts?: { [key: string]: any }
}

function parsePackageJson(contents: string): PackageJson {
  try {
    return JSON.parse(contents)
  } catch (e) {
    throw new Error('Unable to parse package.json contents')
  }
}

function pickTestScript(packageJson: PackageJson): string {
  const { scripts = {} } = packageJson
  const testScripts = Object.entries(scripts).filter(([, script]: [string, any]) => {
    const tokens = new Set(String(script).split(' '))
    return tokens.has('jest') || tokens.has(path.join('node_modules', '.bin', 'jest'))
  })
  const scriptNames = testScripts.map(([scriptName]) => scriptName).join(', ')
  log.stderr(`Found ${testScripts.length} possible test script(s) in package.json: ${scriptNames}`)
  const testScript =
    testScripts.find(([scriptName]: [string, any]) => scriptName === 'test') || testScripts[0]
  if (!testScript) {
    throw new Error('Unable to identify any test scripts in package.json')
  }
  const [scriptName] = testScript
  log.stderr(`Picking script "${scriptName}" from package.json`)
  return scriptName
}

async function buildPackageManagerTestCommand(testScriptName: string): Promise<[string, string[]]> {
  // TODO: check if executables actually exist
  if (await exists(path.resolve('yarn.lock'))) {
    log.stderr(`Found yarn.lock file, invoking script "${testScriptName}" using yarn...`)
    return ['yarn', [testScriptName]]
  }
  log.stderr(`Invoking script "${testScriptName}" using npm...`)
  return ['npm', ['run', testScriptName, '--']]
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch (e) {
    return false
  }
}
