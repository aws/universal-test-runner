// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

const PACKAGES_DIR = path.join(__dirname, '..', 'packages')

const dirContents = fs.readdirSync(PACKAGES_DIR)

console.log('Read the following from packages dir:', dirContents)

export const packages = dirContents.map((packagePath) => {
  const packageRoot = path.join(PACKAGES_DIR, packagePath)
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'))
  return {
    packageJson,
    packageRoot,
    packageName: packageJson.name,
  }
})
