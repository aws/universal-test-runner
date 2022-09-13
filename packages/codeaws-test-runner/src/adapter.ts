// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import log from './log'
import path from 'path'

import { Adapter } from '@sentinel-internal/codeaws-test-runner-types'

type Process = Pick<typeof process, 'cwd'>

export async function loadAdapter(
  rawAdapterModule: string,
  processObject: Process,
): Promise<Adapter> {
  const adapterModule =
    {
      jest: '@sentinel-internal/codeaws-test-adapter-jest',
      maven: '@sentinel-internal/codeaws-test-adapter-maven',
      gradle: '@sentinel-internal/codeaws-test-adapter-gradle',
      pytest: '@sentinel-internal/codeaws-test-adapter-pytest',
    }[rawAdapterModule] || rawAdapterModule

  try {
    const adapterImportPath = adapterModule.startsWith('.')
      ? path.join(processObject.cwd(), adapterModule)
      : adapterModule
    const adapter = await import(adapterImportPath)
    log.info('Loaded adapter from', adapterModule)
    return adapter
  } catch (e) {
    log.info('Failed to load adapter from', adapterModule)
    throw e
  }
}
