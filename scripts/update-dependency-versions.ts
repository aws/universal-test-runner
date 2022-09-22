// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs'
import path from 'path'
import { packages } from './packages'

/*
 * Make sure every package  always depends on the latest version of other
 * packages within this monorepo.
 */
packages.forEach((packageToUpdate) => {
  packages.forEach((maybeDependency) => {
    if ((packageToUpdate.packageJson.dependencies ?? {})[maybeDependency.packageName]) {
      packageToUpdate.packageJson.dependencies[
        maybeDependency.packageName
      ] = `^${maybeDependency.packageJson.version}`
    }
  })
})

/*
 * Write a new package.json file for each package inside this monorepo.
 */
packages.forEach((packageToUpdate) => {
  fs.writeFileSync(
    path.join(packageToUpdate.packageRoot, 'package.json'),
    `${JSON.stringify(packageToUpdate.packageJson, null, 2)}\n`,
  )
})
