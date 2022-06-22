// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

const NOTICE_CONTENTS = fs.readFileSync(path.join(__dirname, '..', 'NOTICE'), 'utf-8')
const PACKAGES_DIR = path.join(__dirname, '..', 'packages')

describe('Notice file', () => {
  it.each(fs.readdirSync(PACKAGES_DIR))('is included in the root of %s', (packageRoot) => {
    const packageNoticeContents = fs.readFileSync(
      path.join(PACKAGES_DIR, packageRoot, 'NOTICE'),
      'utf-8',
    )
    expect(packageNoticeContents).toBe(NOTICE_CONTENTS)
  })
})
