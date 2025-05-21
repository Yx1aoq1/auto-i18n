import { getExtname, isDirectory } from '@/utils'
import { Global, LocaleLoader } from '.'
import fs from 'fs'
import { MatchToken } from '@/pickers/utils'
import { HtmlPicker } from '@/pickers/HtmlPicker'
import { VuePicker } from '@/pickers/VuePicker'
import { ScriptPicker } from '@/pickers/ScriptPicker'

export class Translator {
  static async create() {
    const localeLoader = new LocaleLoader(process.cwd())
    await localeLoader.init()
    return new Translator(localeLoader)
  }

  constructor(public readonly localeLoader: LocaleLoader) {}

  /**
   * 如果代码中包含 i18nIgnore 关键字，则该文件忽略国际化
   * @param {*} code
   */
  isIgnore(code: string) {
    return code.includes('i18nIgnore')
  }

  parse(filepath: string) {
    const extname = getExtname(filepath)
    const code = fs.readFileSync(filepath, 'utf-8')
    if (this.isIgnore(code)) return
    let tokens: MatchToken[] | MatchToken[][] = []
    switch (extname) {
      case 'html':
        tokens = HtmlPicker(code)
        break
      case 'vue':
        tokens = VuePicker(code)
        break
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        tokens = ScriptPicker(code, extname)
      default:
        return
    }
    logger.info(tokens)
  }

  translate(filepath: string, opt: { namespace?: string; replace?: boolean }) {
    const { namespace, replace = false } = opt
    const extname = getExtname(filepath)
    if (extname && !Global.enableTransExts.includes(extname)) {
      logger.warn(`暂不支持.${extname}的文件，已跳过文件 ${filepath} `)
      return
    }
    logger.info(`开始处理 ${filepath} ...`)
    this.parse(filepath)
  }
}
