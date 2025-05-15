import fs from 'fs'
import { LocaleLoader } from './localeLoader'
import { getExtname, codeReplace } from './utils/common'
import { parseHTML } from './utils/parseHTML'
import { isChineseChar } from './utils/common'
import { parseTemplate } from './utils/parseTemplate'
import { cloneDeep } from 'lodash'
import { parse } from '@vue/compiler-sfc'
import { Global } from './global'
import { exportFile } from './utils/fs'
import compile from './utils/sfcDescriptorStringify'
import { parseToAST, findChineseText, replaceChineseText } from './utils/babelParser'

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

  /**
   * 解析html
   * @param {*} html
   * @returns
   */
  parseHTML(html) {
    const tokens = []
    parseHTML(html, {
      expectHTML: true,
      shouldKeepComment: false,
      start(tag, attrs, unary, start, end) {
        if (attrs && attrs.length) {
          attrs.map((attr) => {
            if (isChineseChar(attr.value)) {
              tokens.push({
                type: 'attribute',
                ...attr,
                tokens: parseTemplate(attr.value)
              })
            }
          })
        }
      },
      chars(text, start, end) {
        if (isChineseChar(text)) {
          tokens.push({
            type: 'chars',
            text,
            start,
            end,
            tokens: parseTemplate(text)
          })
        }
      }
    })
    return tokens
  }

  /**
   * 解析 JavaScript/TypeScript 代码
   * @param {string} code
   * @param {string} type 文件类型
   * @returns {Array} tokens
   */
  parseScript(code, type) {
    try {
      const ast = parseToAST(code, type)
      return findChineseText(ast)
    } catch (error) {
      logger.error('解析代码失败:', error)
      return []
    }
  }

  parse(filepath) {
    const extname = getExtname(filepath)
    const code = fs.readFileSync(filepath, 'utf-8')
    if (this.isIgnore(code)) return

    switch (extname) {
      case 'html':
        return {
          extname,
          tokens: this.parseHTML(code),
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
          tokens: [this.parseHTML(template), this.parseScript(script, 'js')]
        }
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return {
          extname,
          tokens: this.parseScript(code, extname),
          origin: code,
          ast: parseToAST(code, extname)
        }
      default:
        return
    }
  }

  translate(filepath, namespace, replace = false) {
    try {
      const parseResult = this.parse(filepath)
      if (!parseResult) return

      const { extname, tokens, origin, originSfcDescriptor, sfcDescriptor, ast } = parseResult
      const _self = this

      function handleToken(token, type = '') {
        try {
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
            case 'jsx':
              value = _self.stringToIdentifier(token.text, namespace, params, type)
              break
          }
          return value
        } catch (error) {
          console.error('处理 token 失败:', error, token)
          // 失败时返回原始文本，确保不中断流程
          return token.text || token.value || ''
        }
      }

      let newCode
      try {
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
            newCode = replaceChineseText(ast, (token) => handleToken(token, extname))
            break
          default:
            return
        }

        replace && exportFile(filepath, newCode, { flag: 'w' })
      } catch (error) {
        logger.error('生成代码失败:', error)
        // 如果处理失败，记录错误但不抛出异常
      }
    } catch (error) {
      logger.error('翻译文件失败:', error, filepath)
      // 失败时不抛出异常，确保程序继续运行
    }
  }

  stringToIdentifier(text, namespace, params, type) {
    const localeKey = this.localeLoader.findMatchLocaleKey(text, namespace)
    logger.info(`[auto-i18n] `, `replace: ${text} --> ${localeKey}`)

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
    if (type === 'vueTemplate' || type === 'text' || type === 'chars') {
      return `{{ ${translation} }}`
    }
    if (type === 'vueScript') {
      return `this.${translation}`
    }
    if (type === 'jsx' || type === 'tsx' || type === 'script') {
      // 对于 JSX/TSX，直接返回翻译函数调用，不需要额外的花括号
      // 因为在 babelParser.js 中会使用 JSXExpressionContainer 包装
      return translation
    }

    return translation
  }

  async getLocales(namespace) {
    await this.localeLoader.export(namespace)
  }
}
