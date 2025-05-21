import { Command } from 'commander'
import { pickI18n } from '@/pickers/utils'

export default (program: Command) => {
  program
    .command('example <name>')
    .description('示例命令')
    .option('-d, --debug', '调试模式')
    .action((name: string, options: { debug?: boolean }) => {
      const a = pickI18n('`测试测试 ${value} 测试测试`')
      console.log('🚀 ~ .action ~ a:', a)
    })
}
