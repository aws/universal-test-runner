// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import path from 'path'
import { access } from 'fs/promises'

/*
 * - Use ./node_modules/.bin/jest as the executable if present
 * - Otherwise, use global jest
 */
export async function buildBaseTestCommand(): Promise<[string, string[]]> {
  const jestExecutablePath = path.join('.', 'node_modules', '.bin', 'jest')
  const executable = (await exists(jestExecutablePath)) ? jestExecutablePath : 'jest'
  return [executable, []]
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch (e) {
    return false
  }
}
