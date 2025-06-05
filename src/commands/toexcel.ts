import { LocaleLoader, Global } from '@/plugins'
import { ParsedFile } from '@/types'
import { Command } from 'commander'
import path from 'path'
import xlsx from 'xlsx'

function generateExcelData(localeLoader: LocaleLoader, namespace?: string) {
  const locales = localeLoader.languages
  const cols = ['key', ...locales]
  const data = [cols]
  const sourceLanguageTrans = localeLoader.findTranslateByKeypath({
    locale: Global.sourceLanguage,
    namespace,
  })
  const paths = Object.keys(sourceLanguageTrans)
  paths.map((keypath) => {
    const trans = locales.map((locale) => {
      return localeLoader.findTranslateByKeypath({
        locale,
        namespace,
        keypath,
      }) as string
    })
    const key = namespace ? `${namespace}.${keypath}` : keypath
    data.push([key, ...trans])
  })
  return data
}

export default (program: Command) => {
  program
    .command('toexcel [namespaces]')
    .option('-n, --name [filename]', '输出文件名称')
    .option('-d, --dir [dir]', '输出文件位置')
    .description('将i18n文件转成excel，可以指定[namespaces]，多个以逗号隔开')
    .action(async (namespaces = '', { filename = 'translate', dir = './' }) => {
      const outputPath = path.resolve(dir, `${filename}.xlsx`)
      const localeLoader = new LocaleLoader(process.cwd())
      await localeLoader.init()
      let files: ParsedFile[]
      let namespaceList: string[]
      if (namespaces) {
        namespaceList = namespaces.split(',')
        files = localeLoader.findMatchFileByNamespaces(namespaces)
      } else {
        namespaceList = localeLoader.namespaces
        files = localeLoader.files
      }
      if (!files || !files.length) {
        logger.error('找不到相应的翻译文件')
        return
      }
      const sheets = []
      // 配置了命名空间或存在命名空间配置时，导出按命名空间分成多个子表格
      if (namespaceList.length) {
        namespaceList.map((namespace) => {
          sheets.push({
            name: namespace,
            data: generateExcelData(localeLoader, namespace),
          })
        })
      } else {
        sheets.push({
          name: 'locales',
          data: generateExcelData(localeLoader),
        })
      }
      if (sheets.length) {
        try {
          const workbook = xlsx.utils.book_new()
          sheets.map((sheet) => {
            const worksheet = xlsx.utils.aoa_to_sheet(sheet.data)
            xlsx.utils.book_append_sheet(workbook, worksheet, sheet.name)
          })
          xlsx.writeFile(workbook, outputPath)
          logger.success('成功导出excel')
        } catch (error) {
          logger.error(error)
        }
      } else {
        logger.warn('没有可以导出的内容')
      }
    })
}
