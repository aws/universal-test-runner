// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const ErrorCodes = {
  /*
   * Adapter threw an unrecoverable error when executing tests. NOT to be used
   * for normal test failures, but rather errors that prevented the adapter
   * from executing normally.
   */
  ADAPTER_ERROR: 1101,

  /*
   * Adapter was invoked, but did not return an exit code. This can happen if
   * the child process was terminated due to a signal:
   * https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
   */
  ADAPTER_RETURNED_NO_EXIT_CODE: 1102,

  /*
   * Runner threw an unhandled exception when reading the protocol
   */
  PROTOCOL_ERROR: 1103,

  /*
   * Runner threw and unhandled exception when attempting to load and execute
   * the adapter
   */
  RUNNER_ERROR: 1104,
} as const
