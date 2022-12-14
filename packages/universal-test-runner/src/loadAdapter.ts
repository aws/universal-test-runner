// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { log } from './log'
import path from 'path'

import { Adapter } from '@sentinel-internal/universal-test-runner-types'

export const builtInAdapters: { [key: string]: string } = {
  jest: '@sentinel-internal/universal-test-adapter-jest',
  maven: '@sentinel-internal/universal-test-adapter-maven',
  gradle: '@sentinel-internal/universal-test-adapter-gradle',
  pytest: '@sentinel-internal/universal-test-adapter-pytest',
  dotnet: '@sentinel-internal/universal-test-adapter-dotnet',
} as const

export async function loadAdapter(rawAdapterModule: string, cwd: string): Promise<Adapter> {
  const adapterModule = builtInAdapters[rawAdapterModule] || rawAdapterModule

  try {
    const adapterImportPath = adapterModule.startsWith('.')
      ? path.join(cwd, adapterModule)
      : adapterModule
    const adapter = await import(adapterImportPath)
    log.info('Loaded adapter from', adapterModule)
    return adapter
  } catch (e) {
    log.error('Failed to load adapter from', adapterModule)
    throw e
  }
}
