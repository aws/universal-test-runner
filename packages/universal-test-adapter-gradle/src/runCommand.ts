// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawnSync } from 'child_process'

interface CommandResult {
  status: number | null
  error?: Error
}

// Return an promise since we're likely to change from spawnSync to spawn (or something else async) at some point
export function runCommand(executable: string, args: string[]): Promise<CommandResult> {
  // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
  const { status, error } = spawnSync(executable, args, { stdio: 'inherit' })

  return Promise.resolve({ status, error })
}
