// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildBaseTestCommand } from '../src/buildBaseTestCommand'
import path from 'path'
import { vol } from 'memfs'

jest.mock('fs')

describe('buildBaseTestCommand', () => {
  beforeEach(() => {
    vol.reset()
  })

  it('returns path to locally installed jest if it exists', async () => {
    vol.fromJSON({ './node_modules/.bin/jest': 'thisisthejestexecutablelol' }, '.')

    const [executable, args] = await buildBaseTestCommand()

    expect(executable).toBe(['node_modules', '.bin', 'jest'].join(path.sep))
    expect(args).toEqual([])
  })

  it('returns path to global jest if local jest is not installed', async () => {
    vol.fromJSON({}, '.')

    const [executable, args] = await buildBaseTestCommand()

    expect(executable).toBe('jest')
    expect(args).toEqual([])
  })
})
