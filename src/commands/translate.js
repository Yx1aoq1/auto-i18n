import { processTranslation } from '../utils/translation'

export default function transalte(program) {
  program
    .command('translate <filepath> [namespace]')
    .description('对<filepath>文件进行中文提取并替换，提取至[namespace]文件中')
    .option('-a, --auto', '是否自动提取namespace', false)
    .action(async (filepath, namespace, { auto }) => {
      await processTranslation(filepath, { namespace, auto, replace: true })
      logger.success('翻译已替换，请自行检查代码语法是否正确')
    })
}
