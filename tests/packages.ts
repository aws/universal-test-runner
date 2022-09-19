// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

const PACKAGES_DIR = path.join(__dirname, '..', 'packages')

export const packages = fs.readdirSync(PACKAGES_DIR).map((packageRoot) => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(PACKAGES_DIR, packageRoot, 'package.json'), 'utf-8'),
  )
  return {
    packageJson,
    packageRoot: path.join(PACKAGES_DIR, packageRoot),
    packageName: packageJson.name,
  }
})
