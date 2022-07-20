// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'

describe('Pull request template', () => {
  it('includes the licensing statement', () => {
    const prTemplate = fs.readFileSync(
      path.join(__dirname, '..', '.github', 'PULL_REQUEST_TEMPLATE.md'),
      'utf-8',
    )

    expect(prTemplate).toContain(
      'By submitting this pull request, I confirm that you can use, modify, copy, and redistribute this contribution, under the terms of your choice.',
    )
  })
})
