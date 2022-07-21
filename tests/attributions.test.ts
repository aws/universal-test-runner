// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

const PACKAGES_DIR = path.join(__dirname, '..', 'packages')
const PACKAGE_DIRS = fs.readdirSync(PACKAGES_DIR)

describe('Attribution file', () => {
  it.each(PACKAGE_DIRS)('is included in the published package for %s', async (packageRoot) => {
    const packageJson = await import(path.join(PACKAGES_DIR, packageRoot, 'package.json'))
    expect(packageJson.files).toContain('THIRD_PARTY_LICENSES')
  })
})
