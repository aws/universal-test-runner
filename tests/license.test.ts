// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

import { packages } from '../scripts/packages'

const LICENSE_CONTENTS = fs.readFileSync(path.join(__dirname, '..', 'LICENSE'), 'utf-8')

describe('License file', () => {
  it.each(packages)('is included in the root of $packageName', ({ packageRoot }) => {
    const packageLicenseContents = fs.readFileSync(path.join(packageRoot, 'LICENSE'), 'utf-8')
    expect(packageLicenseContents).toBe(LICENSE_CONTENTS)
  })
})

describe('License identifier', () => {
  it.each(packages)(
    'is included in the package.json license field for $packageName',
    ({ packageJson }) => {
      expect(packageJson.license).toBe('Apache-2.0')
    },
  )

  it('is included in the root package.json license field', async () => {
    const packageJson = await import('../package.json')
    expect(packageJson.license).toBe('Apache-2.0')
  })
})
