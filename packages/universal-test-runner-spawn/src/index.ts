// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { spawnSync } from 'child_process'

interface SpawnResult {
  status: number | null
  error?: Error
}

/*
 * Consolidating usage of spawn in a single location for a few reasons:
 *
 * - Security: this is the most likely source of command injection, so if we
 * need to change how we invoke external programs, we only have to do it in one
 * place
 *
 * - The interface is really confusing, and this makes it easier for us to wrap
 * it in something more intuitive in the future. child_process#spawn requires
 * args to be passed as an array (for command injection reasons). It will also
 * automatically quote the args. So if you want to execute a command 'ls -la
 * dir1 "dir with spaces"', you should invoke it as:
 *
 * spawnSync('ls', ['-la', 'dir1', 'dir with spaces'])
 *
 * Note that the following are all incorrect:
 *
 * spawnSync('ls -la dir1 "dir with spaces"')
 * spawnSync('ls', ['-la dir1 "dir with spaces"'])
 * spawnSync('ls', ['-la', 'dir1', '"dir with spaces"'])
 */
export function spawn(executable: string, args: string[]): Promise<SpawnResult> {
  // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
  const { status, error } = spawnSync(executable, args, { stdio: 'inherit' })

  // Return an promise since we're likely to change from spawnSync to spawn (or something else async) at some point
  return Promise.resolve({ status, error })
}
