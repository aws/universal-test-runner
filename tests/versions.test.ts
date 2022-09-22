// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import rootPackageJson from '../package.json'

import { packages } from '../scripts/packages'

const PACKAGE_NAMES = packages.map(({ packageName }) => packageName)

/*
 * Keep all of the package versions the same for every package in the monorepo.
 * Track this version in the root package.json. This simplifies our versioning
 * considerably.
 */
test.each(packages)('$packageName has the right version', ({ packageJson }) => {
  expect(packageJson.version).toBe(rootPackageJson.version)
})

/*
 * Make sure that all packages in this monorepo depend on the latest version of
 * any other packages in this monorepo. Production dependencies should specify
 * the caret version exactly, e.g.  if the version of the sibling package is
 * 1.0.0, the dependent package should depend on ^1.0.0, so that the correct
 * versions get installed when the packages are pulled from the registry.
 */
test.each(packages)(
  '$packageName has the right dependency versions',
  ({ packageJson, packageName }) => {
    const siblingDependencies = Object.entries(packageJson.dependencies ?? {}).filter(([name]) => {
      return PACKAGE_NAMES.includes(name)
    })
    const errors: string[] = []
    siblingDependencies.forEach(([dependencyName, version]) => {
      const expectedVersion = `^${rootPackageJson.version}`
      if (version !== expectedVersion) {
        errors.push(`${packageName} should depend on ${dependencyName} version ${expectedVersion}`)
      }
    })
    expect(errors).toHaveLength(0)
  },
)

/*
 * Make sure that all packages in this monorepo depend on the latest version of
 * any other packages in this monorepo. Development dependency versions should
 * be specified as star (i.e. *) for all sibling versions, to make sure it
 * always uses the latest code in the repository when working locally.
 */
test.each(packages)(
  '$packageName has the right development dependency versions',
  ({ packageJson, packageName }) => {
    const siblingDependencies = Object.entries(packageJson.devDependencies ?? {}).filter(
      ([name]) => {
        return PACKAGE_NAMES.includes(name)
      },
    )
    const errors: string[] = []
    siblingDependencies.forEach(([dependencyName, version]) => {
      const expectedVersion = `*`
      if (version !== expectedVersion) {
        errors.push(
          `${packageName} should depend on ${dependencyName} version ${expectedVersion} (development dependency)`,
        )
      }
    })
    expect(errors).toHaveLength(0)
  },
)
