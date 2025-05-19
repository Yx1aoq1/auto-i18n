import fs from 'fs'
import { LocaleLoader } from './localeLoader'
import { getExtname, codeReplace } from './utils/common'
import { parseScript, parseHTML } from './utils/parseScript'
import { cloneDeep } from 'lodash'
import { parse } from '@vue/compiler-sfc'
import { Global } from './global'
import { exportFile } from './utils/fs'
import compile from './utils/sfcDescriptorStringify'

export class Translator {
  static async create() {
    const localeLoader = new LocaleLoader(process.cwd())
    await localeLoader.init()
    return new Translator(localeLoader)
  }

  constructor(localeLoader) {
    this.localeLoader = localeLoader
  }

  /**
   * 如果代码中包含 i18nIgnore 关键字，则该文件忽略国际化
   * @param {*} code
   */
  isIgnore(code) {
    return code.includes('i18nIgnore')
  }

  parse(filepath) {
    const extname = getExtname(filepath)
    const code = fs.readFileSync(filepath, 'utf-8')
    if (this.isIgnore(code)) return

    switch (extname) {
      case 'html':
        return {
          extname,
          tokens: parseHTML(code),
          origin: code
        }
      case 'vue':
        const originSfcDescriptor = parse(code).descriptor
        const sfcDescriptor = cloneDeep(originSfcDescriptor)
        const template = sfcDescriptor.template.content
        // 兼容setup语法
        const script = (sfcDescriptor.script || sfcDescriptor.scriptSetup || { content: '' }).content
        return {
          extname,
          originSfcDescriptor,
          sfcDescriptor,
          tokens: [parseHTML(template), parseScript(script, 'js')]
        }
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return {
          extname,
          tokens: parseScript(code, extname),
          origin: code
        }
      default:
        return
    }
  }

  translate(filepath, namespace, replace = false) {
    const parseResult = this.parse(filepath)
    if (!parseResult) return

    const { extname, tokens, origin, originSfcDescriptor, sfcDescriptor, ast } = parseResult
    const _self = this

    function handleToken(token, type = '') {
      let value

      const params = (token.params || []).map((item) => ({
        name: item.name,
        value: item.expression && item.expression
      }))

      switch (token.type) {
        case 'chars':
          value = codeReplace(token.text, token.tokens, (t) => handleToken(t, t.type))
          break
        case 'attribute':
          value = codeReplace(token.value, token.tokens, (t) => handleToken(t, 'attribute'))
          if (['jsx', 'tsx'].includes(type)) {
            value = `${token.name}="{${value}}"`
          }
          if (type === 'vueTemplate') {
            value = `${token.name[0] === ':' ? '' : ':'}${token.name}="${value}"`
          }
          if (type === 'html' && Global.translateMode === 'angular') {
            value = `${token.name[0] === '[' ? token.name : `[${token.name}]`}="${value}"`
          }
          break
        case 'string':
        case 'text':
        case 'template':
          value = _self.stringToIdentifier(token.text, namespace, params, type, extname)
          break
      }
      return value
    }

    let newCode
    switch (extname) {
      case 'html':
        newCode = codeReplace(origin, tokens, (t) => handleToken(t, 'html'))
        break
      case 'vue':
        sfcDescriptor.template.content = codeReplace(sfcDescriptor.template.content, tokens[0], (t) => handleToken(t, 'vueTemplate'))
        if (sfcDescriptor.script) {
          sfcDescriptor.script.content = codeReplace(sfcDescriptor.script.content, tokens[1], (t) => handleToken(t, 'vueScript'))
        }
        if (sfcDescriptor.scriptSetup) {
          sfcDescriptor.scriptSetup.content = codeReplace(sfcDescriptor.scriptSetup.content, tokens[1], (t) => handleToken(t, 'script'))
        }
        newCode = compile(sfcDescriptor)
        break
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        newCode = codeReplace(origin, tokens, (token) => handleToken(token, extname))
        break
      default:
        return
    }

    replace && exportFile(filepath, newCode, { flag: 'w' })
  }

  stringToIdentifier(text, namespace, params, type, extname) {
    const localeKey = this.localeLoader.findMatchLocaleKey(text, namespace)
    logger.info(`replace: ${text} --> ${localeKey}`)

    // 处理参数，保持原始表达式
    const param = params
      .map((item) => {
        if (!item.value) return item.name
        // 如果是复杂表达式，直接使用原始表达式
        return `${item.name}: ${item.expression || item.value}`
      })
      .filter(Boolean) // 过滤掉空值
      .join(', ')

    // 构造翻译函数调用
    const buildTranslation = (key, parameters) => {
      const translationKey = `'${key}'`
      const translationParams = parameters ? `, {${parameters}}` : ''

      if (Global.translateMode === 'react') {
        return `t(${translationKey}${translationParams})`
      }
      if (Global.translateMode === 'vue') {
        return `$t(${translationKey}${translationParams})`
      }
      if (Global.translateMode === 'angular') {
        return `translate.instant(${translationKey}${translationParams})`
      }
      // 默认使用 i18n.t
      return `i18n.t(${translationKey}${translationParams})`
    }

    // 构造最终的翻译表达式
    const translation = buildTranslation(localeKey, param)

    // 根据不同环境包装表达式
    if (['jsx', 'tsx'].includes(extname) && type === 'text') {
      return `{${translation}}`
    }
    if (type === 'vueTemplate' || type === 'text') {
      return `{{ ${translation} }}`
    }
    if (type === 'vueScript') {
      return `this.${translation}`
    }

    return translation
  }

  async getLocales(namespace) {
    await this.localeLoader.export(namespace)
  }
}
