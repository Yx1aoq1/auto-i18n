import { getExtname, isDirectory, travelDir, writeFile } from '@/utils'
import { Global, LocaleLoader } from '.'
import fs from 'fs'
import { MatchToken, replaceI18n } from '@/transform/utils'
import { TransformHTML, TransformScript, TransformVue } from '@/transform'

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
  private isIgnore(code: string) {
    return code.includes('i18nIgnore')
  }

  private parse(filepath: string, namespace?: string) {
    const extname = getExtname(filepath)
    const code = fs.readFileSync(filepath, 'utf-8')
    if (this.isIgnore(code)) return

    const toI18nFunc = (
      text: string,
      type: MatchToken['type'],
      namespace: string | undefined,
      expression: string
    ) => {
      const localeKey = this.localeLoader.findMatchLocaleKey(text, namespace)
      logger.info(`Match: ${text} --> ${localeKey}`)
      const translationKey = `'${localeKey}'${expression ? `, ${expression}` : ''}`
      return translationKey
    }

    const replace = (token: MatchToken, origin: string) => {
      let replaceValue = origin
      let expression = ''
      if (token.type !== 'attribute' && token.type !== 'chars') {
        const params = (token.params ?? []).map((item) => ({
          name: item.name,
          value: item.expression
            ? replaceI18n(item.expression, item?.tokens ?? [], replace)
            : null,
        }))
        expression = params
          .map((item) => {
            if (!item.value) return item.name
            // 如果是复杂表达式，直接使用原始表达式
            return `${item.name}: ${item.value}`
          })
          .join(', ')
      }
      switch (token.type) {
        case 'chars':
          replaceValue = replaceI18n(token.text, token.tokens, replace)
          break
        case 'attribute':
          const value = replaceI18n(token.value, token.tokens, replace)
          if (['jsx', 'tsx'].includes(extname)) {
            replaceValue = `${token.name}={${value}}`
          }
          if (extname === 'vue') {
            replaceValue = `${token.name[0] === ':' ? '' : ':'}${token.name}="${value}"`
          }
          if (extname === 'html' && Global.translateMode === 'angular') {
            replaceValue = `${token.name[0] === '[' ? token.name : `[${token.name}]`}="${value}"`
          }
          break
        case 'string':
        case 'text':
        case 'template':
          replaceValue = toI18nFunc(
            token.text,
            token.type,
            namespace,
            expression
          )
          break
      }

      return replaceValue
    }

    switch (extname) {
      case 'html':
        return TransformHTML(code, replace)
      case 'vue':
        return TransformVue(code, replace)
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return TransformScript(code, extname, replace)
      default:
        return
    }
  }

  private translateSingle(
    filepath: string,
    opt: { namespace?: string; replace?: boolean }
  ) {
    const { namespace, replace = false } = opt
    const extname = getExtname(filepath)
    if (extname && !Global.enableTransExts.includes(extname)) {
      logger.warn(`暂不支持.${extname}的文件，已跳过文件 ${filepath} `)
      return
    }
    logger.info(`开始处理 ${filepath} ...`)
    const result = this.parse(filepath, namespace)
    if (result && replace) {
      writeFile(filepath, result?.result)
    }
  }

  async translate(
    filepath: string,
    opt: { namespace?: string; replace?: boolean }
  ) {
    if (isDirectory(filepath)) {
      travelDir(filepath, (path) => {
        this.translateSingle(path, opt)
      })
    } else {
      this.translateSingle(filepath, opt)
    }
    logger.info(`开始导出翻译文件...`)
    await this.localeLoader.export(opt.namespace)
  }
}
