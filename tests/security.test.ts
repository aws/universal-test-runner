// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

describe('Security file', () => {
  it('contains information on where to report security vulnerabilities', () => {
    const securityFile = fs.readFileSync(path.resolve(__dirname, '..', 'SECURITY.md'), 'utf-8')
    expect(securityFile).toContain(
      'If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.',
    )
  })
})
