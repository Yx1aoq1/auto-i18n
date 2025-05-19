import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { isChineseChar } from './common'
import { parseTemplate } from './parseTemplate'
import { parseHTML as _parseHTML } from './parseHTML'

/**
 * 解析html
 * @param {*} html
 * @returns
 */
export function parseHTML(html, offset = 0) {
  const tokens = []
  _parseHTML(html, {
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
          start: offset + start,
          end: offset + end,
          tokens: parseTemplate(text)
        })
      }
    }
  })
  return tokens
}
/**
 * 解析代码为 AST
 * @param {string} code 源代码
 * @param {string} type 文件类型
 * @returns {Object} AST
 */
function parseToAST(code, type) {
  const plugins = ['jsx', ['typescript', { isTSX: type === 'tsx' }], 'classProperties', 'decorators-legacy']

  return parser.parse(code, {
    sourceType: 'module',
    plugins
  })
}

export function parseScript(code, type) {
  const ast = parseToAST(code, type)
  const tokens = []
  traverse(ast, {
    StringLiteral(path) {
      if (isChineseChar(path.node.value)) {
        // Check if this string is part of a JSX attribute
        const isJSXAttribute = path.parent && path.parent.type === 'JSXAttribute'
        if (isJSXAttribute) {
          tokens.push({
            type: 'attribute',
            name: path.parent.name.name,
            start: path.parent.start,
            end: path.parent.end,
            value: path.node.value,
            tokens: parseTemplate(path.node.value)
          })
        } else {
          tokens.push({
            type: 'string',
            text: path.node.value,
            start: path.node.start,
            end: path.node.end
          })
        }
      }
    },
    TemplateLiteral(path) {
      const hasChineseText = path.node.quasis.some((quasi) => {
        return isChineseChar(quasi.value.raw)
      })

      if (hasChineseText) {
        tokens.push(...parseTemplate(generate(path.node).code, path.node.start))
      }
    },
    JSXText(path) {
      // 检查相邻的 JSX 表达式
      let text = path.node.value.trim()
      if (!text || !isChineseChar(text)) return
      const template = generate(path.parent).code
      const offset = path.parent.start
      tokens.push(...parseHTML(template, offset))
    }
  })

  return tokens
}
