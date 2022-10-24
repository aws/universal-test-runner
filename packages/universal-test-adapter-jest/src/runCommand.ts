// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawnSync } from 'child_process'

interface CommandResult {
  status: number | null
}

// Return an promise since we're likely to change from spawnSync to spawn (or something else async) at some point
export function runCommand(
  executable: string,
  args: string[],
  extraEnvVars = {},
): Promise<CommandResult> {
  const { status } = spawnSync(executable, args, {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnvVars },
  })

  return Promise.resolve({ status })
}
