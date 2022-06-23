// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

const LICENSE_CONTENTS = fs.readFileSync(path.join(__dirname, '..', 'LICENSE'), 'utf-8')
const PACKAGES_DIR = path.join(__dirname, '..', 'packages')
const PACKAGE_DIRS = fs.readdirSync(PACKAGES_DIR)

describe('License file', () => {
  it.each(PACKAGE_DIRS)('is included in the root of %s', (packageRoot) => {
    const packageLicenseContents = fs.readFileSync(
      path.join(PACKAGES_DIR, packageRoot, 'LICENSE'),
      'utf-8',
    )
    expect(packageLicenseContents).toBe(LICENSE_CONTENTS)
  })
})

describe('License identifier', () => {
  it.each(PACKAGE_DIRS)(
    'is included in the package.json license field for %s',
    async (packageRoot) => {
      const packageJson = await import(path.join(PACKAGES_DIR, packageRoot, 'package.json'))
      expect(packageJson.license).toBe('Apache-2.0')
    },
  )

  it('is included in the root package.json license field', async () => {
    const packageJson = await import('../package.json')
    expect(packageJson.license).toBe('Apache-2.0')
  })
})
