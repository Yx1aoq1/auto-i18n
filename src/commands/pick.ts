import fs from 'fs'
import { Command } from 'commander'
import { Global, Translator } from '@/plugins'

export default (program: Command) => {
  program
    .command('pick <filepath> [namespace]')
    .description('对<filepath>文件进行中文提取，提取至[namespace]文件中')
    .option('-a, --auto', '是否自动提取namespace', false)
    .option('-d, --debug', '输出Debug打印内容', false)
    .action(async (filepath, namespace, { auto, debug }) => {
      // 验证目录存在
      try {
        fs.accessSync(filepath, fs.constants.F_OK)
      } catch (error) {
        logger.error(`${filepath}文件或文件夹不存在`)
        process.exit()
      }

      Global.isDebugMode = debug

      const translator = await Translator.create()

      await translator.translate(filepath, { namespace })

      logger.success('翻译已导出至相应目录，请自行检查代码语法是否正确')
    })
}
