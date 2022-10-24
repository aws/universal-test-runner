// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import path from 'path'

import { packages } from './packages'
import { findPackageRoot } from './findPackageRoot'

// This list is not comprehensive, but simply covers the approved licenses
// we're using so far.
const PERMISSIBLE_DEVELOPMENT_USE_LICENSES = [
  'Apache-2.0',
  'MIT',
  'ISC',
  'BSD-2-Clause',
  '0BSD',
  'BSD-3-Clause',
  '(MIT OR CC0-1.0)',
  'CC-BY-4.0',
  '(MIT OR Apache-2.0)',
  'CC0-1.0',
  'CC-BY-3.0',
]

async function validateLicenses(
  packageName: string,
  depth = 0,
  seen: Set<string> = new Set(),
): Promise<void> {
  // Node.js built-ins that are now natively available, but might be polyfilled
  // by some older packages
  if (['string_decoder', 'punycode'].includes(packageName)) {
    return
  }

  if (seen.has(packageName)) {
    return
  }
  seen.add(packageName)

  const packageRoot = await findPackageRoot(packageName)

  const { dependencies, licenseId } = await loadPackageJsonInfo(packageRoot)

  console.log(`Validating license ${licenseId} for package ${packageName}...`)

  if (!PERMISSIBLE_DEVELOPMENT_USE_LICENSES.includes(licenseId)) {
    throw new Error(
      `License ${licenseId} for package ${packageName} is not a permissible third-party license for development use.`,
    )
  }

  await Promise.all(
    Object.keys(dependencies || {}).map((dependency) =>
      validateLicenses(dependency, depth + 1, seen),
    ),
  )
}

async function loadPackageJsonInfo(
  packageRoot: string,
): Promise<{ dependencies: string[]; devDependencies: string[]; licenseId: string }> {
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const packageJson = await import(packageJsonPath)
  return {
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    licenseId: packageJson.license,
  }
}

async function run() {
  const rootPackageJson = await loadPackageJsonInfo(path.join(__dirname, '..'))
  const allPackageJsons = [rootPackageJson, ...packages.map(({ packageJson }) => packageJson)]
  await Promise.all(
    allPackageJsons.map((packageJson) => {
      const allPackageNames = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
      ]
      return Promise.all(allPackageNames.map((packageName) => validateLicenses(packageName)))
    }),
  )
}

if (require.main === module) {
  void (async () => {
    await run()
    console.log('Done.')
  })()
}
