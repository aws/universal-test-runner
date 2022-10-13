// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const ProtocolEnvVars = {
  /*
   * The version of the protocol being used, e.g. '0.1.0'
   */
  VERSION: 'TEP_VERSION',

  /*
   * Pipe-separated list of tests to be run. Suite name and filepath can be
   * specified optionally, using hashes. e.g.
   *
   * 'test1|test4|test9'
   * 'suite1#test1|suite2#test4|suite#test9'
   * 'file1.js#suite1#test1|file2.js#suite2#test4|file3.js#suite#test9'
   */
  TESTS_TO_RUN: 'TEP_TESTS_TO_RUN',

  TEST_REPORT_FORMAT: 'TEP_TEST_REPORT_FORMAT',

  TEST_REPORT_OUTPUT_DIR: 'TEP_TEST_REPORT_OUTPUT_DIR',

  TEST_REPORT_FILE_NAME: 'TEP_TEST_REPORT_FILE_NAME',

  LOG_FILE_NAME: 'TEP_LOG_FILE_NAME',
} as const
