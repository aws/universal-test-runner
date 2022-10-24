// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import path from 'path'
import fs from 'fs/promises'

export async function findPackageRoot(packageName: string): Promise<string> {
  let packageMain
  try {
    packageMain = require.resolve(packageName)
  } catch {
    try {
      // Packages that don't have "main" fields in package.json
      packageMain = require.resolve(path.join(packageName, 'package.json'))
    } catch (e) {
      // Packages that don't have main and don't have a package.json "exports" entry
      // This is super hacky as it pulls out the package root from the resulting error message
      ;[packageMain] = (e as Error).message.split(' ').reverse()
      console.warn(`WARNING: extracted package main path from error message: ${packageMain}`)
    }
  }
  let packageRoot = path.dirname(packageMain)
  while (!(await foundPackageJsonWithLicenseInfo(packageRoot))) {
    packageRoot = path.dirname(packageRoot)
  }
  return packageRoot
}

async function foundPackageJsonWithLicenseInfo(directory: string): Promise<boolean> {
  const packageJsonPath = path.join(directory, 'package.json')
  const foundPackageJson = await exists(packageJsonPath)
  if (foundPackageJson) {
    const contents = await import(packageJsonPath)
    return Boolean(contents.license)
  }
  return false
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}
