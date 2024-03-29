// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import fs from 'fs/promises'
import path from 'path'

import { packages } from './packages'

const AUTO_GENERATED_START_MARKER =
  '<!-- START Auto-generated by generate-readmes.ts, do not modify START -->'
const AUTO_GENERATED_END_MARKER =
  '<!-- END Auto-generated by generate-readmes.ts, do not modify END -->'

export function getReadmeText(packageName: string): string {
  const uriEncodedPackageName = encodeURIComponent(packageName)

  return `${AUTO_GENERATED_START_MARKER}

# ${packageName}

[![npm version](https://img.shields.io/npm/v/${packageName})](https://www.npmjs.com/package/${packageName})
[![npm downloads](https://img.shields.io/npm/dm/${packageName})](https://npm-stat.com/charts.html?package=${uriEncodedPackageName})

This package is part of the Universal Test Runner project, see the full documentation on GitHub: https://github.com/aws/universal-test-runner#readme

${
  packageName !== '@aws/universal-test-runner' &&
  packageName !== '@sentinel-internal/universal-test-runner'
    ? '**This package is internal to the Universal Test Runner project, and is not guaranteed to follow semantic versioning. You should have no need to install it yourself or depend on it directly.** See [these docs](https://github.com/aws/universal-test-runner#-packages-in-this-monorepo) for more information.'
    : ''
}

<!-- Place any custom README contents after the following marker -->

${AUTO_GENERATED_END_MARKER}
`
}

function run() {
  return Promise.all(
    packages.map(async ({ packageName, packageRoot }) => {
      const readmePath = path.join(packageRoot, 'README.md')
      let customContents = ''
      try {
        const existingReadmeContents = await fs.readFile(readmePath, 'utf-8')
        ;[, customContents] =
          existingReadmeContents.split(AUTO_GENERATED_END_MARKER) || existingReadmeContents
      } catch (e: any) {
        // It's fine if the README doesn't exist, just write a new file
        if (e.code !== 'ENOENT') {
          throw e
        }
      }
      console.log('Writing README for', packageName)
      await fs.writeFile(readmePath, getReadmeText(packageName) + customContents)
    }),
  )
}

if (require.main === module) {
  void (async () => {
    await run()
    console.log('Done.')
  })()
}
