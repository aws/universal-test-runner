// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import fs from 'fs/promises'
import path from 'path'

export async function getFullAttributionsText(packageName: string): Promise<string> {
  const attributions = await getAttributions(packageName)
  return `${packageName} includes the following third-party software/licensing:\n\n${attributions}`
}

// TODO Check that licenses are permissible
async function getAttributions(
  packageName: string,
  depth = 0,
  seen: Set<string> = new Set(),
): Promise<string> {
  if (seen.has(packageName)) {
    return ''
  }
  seen.add(packageName)

  const packageRoot = await findPackageRoot(packageName)

  const dependencyAttributions = await loadDependencies(packageRoot).then((dependencies) =>
    Promise.all(dependencies.map((dependency) => getAttributions(dependency, depth + 1, seen))),
  )

  const licenseFile = (await fs.readdir(packageRoot)).find((name) =>
    name?.toLowerCase().includes('license'),
  )
  if (!licenseFile) {
    throw new Error(`No license found for ${packageName}`)
  }

  return [
    await getSingleAttribution(packageName, path.join(packageRoot, licenseFile), depth),
    ...dependencyAttributions,
  ].join('')
}

async function findPackageRoot(packageName: string): Promise<string> {
  let packageRoot = path.dirname(require.resolve(packageName))
  while (!(await exists(path.join(packageRoot, 'package.json')))) {
    packageRoot = path.dirname(packageRoot)
  }
  return packageRoot
}

async function loadDependencies(packageRoot: string): Promise<string[]> {
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const packageJson = await import(packageJsonPath)
  return Object.keys(packageJson.dependencies || {}).sort()
}

async function getSingleAttribution(packageName: string, licensePath: string, depth: number) {
  if (depth === 0) {
    return ''
  }
  const licenseText = await fs.readFile(licensePath, 'utf-8')
  return `${packageName} -- https://npmjs.com/package/${packageName}\n\n${licenseText}\n----------\n\n`
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

async function run() {
  const packagePaths = await fs.readdir(path.join(process.cwd(), 'packages'))
  return Promise.all(
    packagePaths.map(async (packagePath) => {
      const attributionsFilePath = path.join(
        process.cwd(),
        'packages',
        packagePath,
        'THIRD_PARTY_LICENSES',
      )
      console.log(`Writing attribution file to ${attributionsFilePath}`)
      const packageJson = await import(
        path.join(process.cwd(), 'packages', packagePath, 'package.json')
      )
      await fs.writeFile(attributionsFilePath, await getFullAttributionsText(packageJson.name))
    }),
  )
}

if (require.main === module) {
  run().then(() => console.log('Done'))
}
