// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

const LICENSE_CONTENTS = fs.readFileSync(path.join(__dirname, '..', 'LICENSE'), 'utf-8')
const PACKAGES_DIR = path.join(__dirname, '..', 'packages')

describe('License file', () => {
  it.each(fs.readdirSync(PACKAGES_DIR))('is included in the root of %s', (packageRoot) => {
    expect(fs.readFileSync(path.join(PACKAGES_DIR, packageRoot, 'LICENSE'), 'utf-8')).toBe(
      LICENSE_CONTENTS,
    )
  })
})
