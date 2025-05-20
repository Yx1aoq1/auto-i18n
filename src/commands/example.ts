import { Command } from 'commander'

export default (program: Command) => {
  program
    .command('example <name>')
    .description('示例命令')
    .option('-d, --debug', '调试模式')
    .action((name: string, options: { debug?: boolean }) => {
      // 命令逻辑
      console.log(`你好 ${name}`, options.debug ? ' (调试模式)' : '')
    })
}
