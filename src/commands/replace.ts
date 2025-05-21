import fs from 'fs'
import { Command } from 'commander'
import { pickI18n } from '@/transform/utils'
import { Translator } from '@/plugins/Tanslator'

export default (program: Command) => {
  program
    .command('replace <filepath> [namespace]')
    .description('对<filepath>文件进行中文提取并替换，提取至[namespace]文件中')
    .option('-a, --auto', '是否自动提取namespace', false)
    .action(async (filepath, namespace, { auto }) => {
      // 验证目录存在
      try {
        fs.accessSync(filepath, fs.constants.F_OK)
      } catch (error) {
        logger.error(`${filepath}文件或文件夹不存在`)
        process.exit()
      }

      const translator = await Translator.create()

      translator.translate(filepath, { namespace, replace: true })

      logger.success('翻译已替换，请自行检查代码语法是否正确')
    })
}
