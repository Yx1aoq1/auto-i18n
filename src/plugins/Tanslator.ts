import { isDirectory, travelDir } from '@/utils'
import { Global, LocaleLoader } from '.'
import { MatchToken, replaceI18n } from '@/transform/utils'
import { TransformHTML, TransformScript, TransformVue } from '@/transform'
import { VueExtType } from '@/types'
import { template } from 'lodash'
import { File } from '.'

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
    const extname = File.getExtname(filepath)
    const code = File.readSync(filepath)
    if (this.isIgnore(code)) return

    const toI18nFunc = (
      text: string,
      type: MatchToken['type'],
      namespace: string | undefined,
      expression: string,
      ext?: VueExtType
    ) => {
      const localeKey = this.localeLoader.findMatchLocaleKey(text, namespace)
      logger.info(`Match: ${text} --> ${localeKey}`)
      const key = `'${localeKey}'${expression ? `, ${expression}` : ''}`

      if (typeof Global.i18nFuncTemp === 'function') {
        return Global.i18nFuncTemp({
          text,
          key,
          extname,
          type,
          ext,
        })
      }

      const compiled = template(Global.i18nFuncTemp)
      const [context, func] = compiled({ key }).split('.')

      if (ext === 'vueTemplate' && type === 'text') {
        return `{{ ${func ?? context} }}`
      }
      if (ext === 'vueScript') {
        return `this.${func ?? context}`
      }
      if (['jsx', 'tsx'].includes(extname) && type === 'text') {
        return `{${func ?? context}}`
      }
      if (type === 'string') {
        return `${func ?? context}`
      }
      return func ? `${context}.${func}` : context
    }

    const replace = (token: MatchToken, origin: string, ext?: VueExtType) => {
      let replaceValue = origin
      let expression = ''
      if (token.type !== 'attribute' && token.type !== 'chars') {
        const params = (token.params ?? []).map((item) => ({
          name: item.name,
          value: item.expression
            ? replaceI18n(item.expression, item?.tokens ?? [], (t, o) =>
                replace(t, o, ext)
              )
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
          replaceValue = replaceI18n(token.text, token.tokens, (t, o) =>
            replace(t, o, ext)
          )
          break
        case 'attribute':
          const value = replaceI18n(token.value, token.tokens, (t, o) =>
            replace(t, o, ext)
          )
          if (['jsx', 'tsx'].includes(extname)) {
            replaceValue = `${token.name}={${value}}`
          }
          if (extname === 'vue') {
            replaceValue = `${token.name[0] === ':' ? '' : ':'}${token.name}="${value}"`
          }
          if (extname === 'html') {
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
            expression,
            ext
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

  private single(
    filepath: string,
    opt: { namespace?: string; replace?: boolean }
  ) {
    const { namespace, replace = false } = opt
    const extname = File.getExtname(filepath)
    if (extname && !Global.enableTransExts.includes(extname)) {
      logger.warn(`暂不支持.${extname}的文件，已跳过文件 ${filepath} `)
      return
    }
    logger.info(`开始处理 ${filepath} ...`)
    const result = this.parse(filepath, namespace)
    if (result && replace) {
      File.writeSync(filepath, result?.result)
    }
  }

  async translate(
    filepath: string,
    opt: { namespace?: string; replace?: boolean }
  ) {
    if (isDirectory(filepath)) {
      travelDir(filepath, (path) => {
        this.single(path, opt)
      })
    } else {
      this.single(filepath, opt)
    }
    logger.info(`开始导出翻译文件...`)
    await this.localeLoader.export(opt.namespace)
  }
}
