// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

describe('package-lock.json', () => {
  it('does not include any codeartifact URLs', () => {
    const packageLockJson = fs.readFileSync(path.join(__dirname, '..', 'package-lock.json'))
    expect(packageLockJson).not.toContain('codeartifact')
  })
})
