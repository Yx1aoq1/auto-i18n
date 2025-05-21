#!/usr/bin/env node

import './utils/logger'
import { Command } from 'commander'
import { version } from '../package.json'
import commands from './commands'

const program = new Command()

program.version(version).description('Auto I18n Tool')
// 注册命令
commands(program)

program.parse(process.argv)
