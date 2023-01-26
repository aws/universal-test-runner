// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import path from 'path'
import fs from 'fs/promises'

function run() {
  const filesWithAwsScope = process.argv.slice(2)

  console.log(
    'Replacing @aws scope with @sentinel-internal scope in',
    filesWithAwsScope.length,
    'files...',
  )

  return Promise.all(
    filesWithAwsScope.map(async (file) => {
      const filePath = path.join(process.cwd(), file)
      const contents = await fs.readFile(filePath, 'utf-8')
      const newContents = contents
        .replace(/@aws/g, '@sentinel-internal')
        .replace(
          new RegExp(encodeURIComponent('@aws'), 'g'),
          encodeURIComponent('@sentinel-internal'),
        )
      await fs.writeFile(filePath, newContents)
    }),
  )
}

if (require.main === module) {
  void (async () => {
    await run()
    console.log('Done.')
  })()
}
