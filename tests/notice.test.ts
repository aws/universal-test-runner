// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

import { packages } from '../scripts/packages'

const NOTICE_CONTENTS = fs.readFileSync(path.join(__dirname, '..', 'NOTICE'), 'utf-8')

describe('Notice file', () => {
  it.each(packages)('is included in the root of $packageName', ({ packageRoot }) => {
    const packageNoticeContents = fs.readFileSync(path.join(packageRoot, 'NOTICE'), 'utf-8')
    expect(packageNoticeContents).toBe(NOTICE_CONTENTS)
  })

  it.each(packages)('is included in the published package for $packageName', ({ packageJson }) => {
    expect(packageJson.files).toContain('NOTICE')
  })
})
