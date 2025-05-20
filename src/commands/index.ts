import fs from 'fs'
import path from 'path'
import { Command } from 'commander'
import { CommandModule } from '@/types'

const commands: CommandModule[] = []

// 读取当前目录下所有命令文件
fs.readdirSync(__dirname)
  .filter((fileName) => fileName !== 'index.ts' && fileName.endsWith('.ts'))
  .forEach((fileName) => {
    // 动态导入命令模块
    const commandPath = path.join(__dirname, fileName)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command = require(commandPath).default as CommandModule
    commands.push(command)
  })

export default function run(program: Command): void {
  commands.forEach((command) => command(program))
}
