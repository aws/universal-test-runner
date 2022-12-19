// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs'
import * as path from 'path'

const nvmrc = fs.readFileSync(path.join(__dirname, '..', '.nvmrc'), 'utf-8').trim()

describe('Node.js version', () => {
  it('matches the major version of @types/node', async () => {
    const packageJson = await import('../package.json')
    expect(packageJson.devDependencies['@types/node']).toBe(`^${nvmrc}`)
  })
})
