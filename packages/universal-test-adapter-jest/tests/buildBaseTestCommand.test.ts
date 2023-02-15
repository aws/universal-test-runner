// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildBaseTestCommand } from '../src/buildBaseTestCommand'
import path from 'path'

describe('buildBaseTestCommand', () => {
  it('returns path to locally installed jest if it exists', async () => {
    const [executable, args] = await buildBaseTestCommand(() => Promise.resolve())

    expect(executable).toBe(['node_modules', '.bin', 'jest'].join(path.sep))
    expect(args).toEqual([])
  })

  it('returns path to global jest if local jest is not installed', async () => {
    const [executable, args] = await buildBaseTestCommand(() => Promise.reject())

    expect(executable).toBe('jest')
    expect(args).toEqual([])
  })
})
