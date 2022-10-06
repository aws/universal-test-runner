// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCodes } from '../bin/ErrorCodes'

test('All error codes are unique', () => {
  const values = Object.values(ErrorCodes)
  expect(new Set(values).size).toBe(values.length)
})
