// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

import { getFullAttributionsText } from '../scripts/generate-attributions'

import { packages } from '../scripts/packages'

describe('Attribution file', () => {
  it.each(packages)(
    'is included in the published package for $packageName',
    async ({ packageJson }) => {
      expect(packageJson.files).toContain('THIRD_PARTY_LICENSES')
    },
  )

  it.each(packages)(
    'contains the correct contents for $packageName',
    async ({ packageJson, packageRoot }) => {
      const attributions = fs.readFileSync(path.join(packageRoot, 'THIRD_PARTY_LICENSES'), 'utf-8')
      const expectedAttributions = await getFullAttributionsText(packageJson.name)
      expect(attributions).toBe(expectedAttributions)
    },
  )
})
