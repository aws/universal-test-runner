#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import run from '../src'

const argv = yargs(hideBin(process.argv)).parseSync()

run(argv._)
