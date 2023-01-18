// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { log } from './log'
import path from 'path'

import { Adapter } from '@aws/universal-test-runner-types'

export const builtInAdapters: { [key: string]: string } = {
  jest: '@aws/universal-test-adapter-jest',
  maven: '@aws/universal-test-adapter-maven',
  gradle: '@aws/universal-test-adapter-gradle',
  pytest: '@aws/universal-test-adapter-pytest',
  dotnet: '@aws/universal-test-adapter-dotnet',
} as const

export async function loadAdapter(rawAdapterModule: string, cwd: string): Promise<Adapter> {
  const adapterModule = builtInAdapters[rawAdapterModule] || rawAdapterModule

  try {
    const adapterImportPath = adapterModule.startsWith('.')
      ? resolveCustomAdapterPath(cwd, adapterModule)
      : adapterModule
    const adapter = await import(adapterImportPath)
    log.info('Loaded adapter from', adapterModule)
    return adapter
  } catch (e) {
    log.error('Failed to load adapter from', adapterModule)
    throw e
  }
}

function resolveCustomAdapterPath(cwd: string, adapterPath: string): string {
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  return path.join(cwd, adapterPath)
}
