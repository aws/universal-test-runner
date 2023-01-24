// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

import { getReadmeText } from '../scripts/generate-readmes'

import { packages } from '../scripts/packages'

describe('README file', () => {
  it.each(packages)(
    'contains the correct contents for $packageName',
    async ({ packageJson, packageRoot }) => {
      const readme = await fs.readFileSync(path.join(packageRoot, 'README.md'), 'utf-8')
      const expectedReadmeStart = getReadmeText(packageJson.name)
      expect(readme.startsWith(expectedReadmeStart)).toBe(true)
    },
  )
})
