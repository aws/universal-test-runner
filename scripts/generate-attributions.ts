// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import fs from 'fs/promises'
import path from 'path'

import { packages } from './packages'
import { findPackageRoot } from './findPackageRoot'

// This list is not comprehensive, but simply covers the approved licenses
// we're using so far.
const PERMISSIBLE_DISTRIBUTION_LICENSES = ['Apache-2.0', 'MIT', 'ISC']

export async function getFullAttributionsText(packageName: string): Promise<string> {
  const attributions = await getAttributions(packageName)
  return `${packageName} includes the following third-party software/licensing:\n\n${attributions}`
}

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

  const { dependencies, version, licenseId } = await loadPackageJsonInfo(packageRoot)

  if (!PERMISSIBLE_DISTRIBUTION_LICENSES.includes(licenseId)) {
    throw new Error(
      `License ${licenseId} for package ${packageName} is not a permissible third-party license for distribution.`,
    )
  }

  const dependencyAttributions = await Promise.all(
    dependencies.map((dependency) => getAttributions(dependency, depth + 1, seen)),
  )

  const packageFiles = await fs.readdir(packageRoot)

  const licenseFile = packageFiles.find((name) => name?.toLowerCase().includes('license'))
  const noticeFile = packageFiles.find((name) => name?.toLowerCase().includes('notice'))

  if (!licenseFile) {
    throw new Error(`No license found for ${packageName}`)
  }

  return [
    await getSingleAttribution(
      packageName,
      version,
      licenseId,
      path.join(packageRoot, licenseFile),
      noticeFile,
    ),
    ...dependencyAttributions,
  ].join('')
}

async function loadPackageJsonInfo(
  packageRoot: string,
): Promise<{ dependencies: string[]; version: string; licenseId: string }> {
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const packageJson = await import(packageJsonPath)
  return {
    dependencies: Object.keys(packageJson.dependencies || {}).sort(),
    version: packageJson.version,
    licenseId: packageJson.license,
  }
}

async function getSingleAttribution(
  packageName: string,
  version: string,
  licenseId: string,
  licensePath: string,
  noticePath?: string,
) {
  if (packages.map(({ packageName }) => packageName).includes(packageName)) {
    return ''
  }
  const licenseText = await fs.readFile(licensePath, 'utf-8')

  // If an Apache-2.0 licensed project includes a NOTICE, it must be included
  // in the attribution file after the license
  const noticeText =
    noticePath && licenseId === 'Apache-2.0' ? await fs.readFile(noticePath, 'utf-8') : ''

  const noticeAttribution = noticeText
    ? `* For ${packageName}@${version} see also this required NOTICE:\n${indent(noticeText)}`
    : ''

  return [
    `** ${packageName}@${version} - https://npmjs.com/package/${packageName}`,
    licenseText,
    noticeAttribution,
    '----------------\n\n',
  ]
    .filter(Boolean)
    .join('\n')
}

function indent(text: string, width = 4) {
  const indentString = ' '.repeat(width)
  return `${indentString}${text.split('\n').join(`\n${indentString}`)}`
}

function run() {
  return Promise.all(
    packages.map(async ({ packageRoot, packageName }) => {
      const attributionsFilePath = path.join(packageRoot, 'THIRD_PARTY_LICENSES')
      console.log(`Writing attribution file to ${attributionsFilePath}`)
      await fs.writeFile(attributionsFilePath, await getFullAttributionsText(packageName))
    }),
  )
}

if (require.main === module) {
  void (async () => {
    await run()
    console.log('Done.')
  })()
}
