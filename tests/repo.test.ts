// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import rootPackageJson from '../package.json'

import { packages } from '../scripts/packages'

const REPO_URL = 'https://github.com/aws/universal-test-runner'

test('Root package.json contains repo information', () => {
  expect(rootPackageJson.repository.url).toBe(REPO_URL)
  expect(rootPackageJson.bugs.url).toBe(`${REPO_URL}/issues`)
  expect(rootPackageJson.homepage).toBe(`${REPO_URL}#readme`)
})

/*
 * These tests ensure that each package contains the correct links to GitHub
 * once published on NPM. Only the main CLI package is "public" for the time
 * being so we link all packages to the root README.
 */
test.each(packages)(
  '$packageName contains the same repo information as the root package.json',
  ({ packageJson }) => {
    expect(packageJson.repository.url).toBe(rootPackageJson.repository.url)
    expect(packageJson.bugs.url).toBe(rootPackageJson.bugs.url)
    expect(packageJson.homepage).toBe(rootPackageJson.homepage)
  },
)
