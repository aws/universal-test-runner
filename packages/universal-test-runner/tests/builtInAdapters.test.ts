// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { builtInAdapters } from '../src/loadAdapter'

import packageJson from '../package.json'

test.each(Object.entries(builtInAdapters))(
  'Package has %s adapter listed as a dependency',
  (adapterName, adapterPackage) => {
    expect(Object.keys(packageJson.dependencies)).toContain(adapterPackage)
  },
)
