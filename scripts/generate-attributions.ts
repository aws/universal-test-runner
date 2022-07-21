// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

const packagePaths = fs.readdirSync(path.join(process.cwd(), 'packages'))

function existsSync(path: string): boolean {
  try {
    fs.accessSync(path)
    return true
  } catch (e) {
    return false
  }
}

// TODO: circular dependencies
// Check license
// Exclude root package
// Tests to verify contents
async function getAttributions(packageName: string): Promise<string> {
  let packageRoot = path.dirname(require.resolve(packageName))
  while (!existsSync(path.join(packageRoot, 'package.json'))) {
    packageRoot = path.dirname(packageRoot)
  }
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const { name, dependencies = {} } = await import(packageJsonPath)
  const dependencyAttributions = await Promise.all(
    Object.keys(dependencies).map((dependency) => {
      return getAttributions(dependency)
    }),
  )
  const licenseFile = fs
    .readdirSync(packageRoot)
    .find((name) => name?.toLowerCase().includes('license'))
  if (!licenseFile) {
    throw new Error(`No license found for ${packageName}`)
  }
  const license = fs.readFileSync(path.join(packageRoot, licenseFile))
  return [`${name}\n\n${license}`, ...dependencyAttributions].join('\n-------------\n\n')
}

async function run() {
  await Promise.all(
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
      const attributionString = `${packageJson.name} includes the following third-party software/licensing:\n\n`
      fs.writeFileSync(
        attributionsFilePath,
        attributionString + (await getAttributions(packageJson.name)),
      )
    }),
  )
}

run().then(() => console.log('Done'))
