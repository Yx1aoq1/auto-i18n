#!/usr/bin/env node

import './utils/logger'
import { Command } from 'commander'
import { version } from '../package.json'
import commands from './commands'

const program = new Command()

program.version(version).description('Auto I18n Tool')
// 注册命令
commands(program)

export function run(argv: string[]) {
  // 如果没有其他命令的话
  if (!argv[2]) {
    program.help()
    return
  }
  program.parse(argv)
}
