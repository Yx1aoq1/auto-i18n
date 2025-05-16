import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import { isChineseChar } from './common'

/**
 * 处理表达式，简化变量名
 * @param {string} expression 表达式代码
 * @returns {string} 简化后的变量名
 */
function simplifyExpression(expression) {
  // 移除空格
  expression = expression.trim()
  // 如果是成员表达式（例如：userData.name），取最后一个部分
  const parts = expression.split('.')
  return parts[parts.length - 1]
}

/**
 * 处理模板字符串内容
 * @param {string} text 原始文本
 * @param {Array} expressions 表达式数组
 * @returns {string} 处理后的文本
 */
function processTemplateText(text, expressions) {
  // 移除开头和结尾的 ` 符号
  text = text.replace(/^`|`$/g, '')

  // 替换所有的 ${xxx} 为 {xxx}，并简化表达式
  let index = 0
  return text.replace(/\$\{([^}]+)\}/g, (match, expr) => {
    if (index < expressions.length) {
      const simplifiedName = simplifyExpression(generate(expressions[index++]).code)
      return `{${simplifiedName}}`
    }
    return match
  })
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
        tokens.push({
          type: 'string',
          text: path.node.value,
          start: path.node.start,
          end: path.node.end,
          path
        })
      }
    },
    TemplateLiteral(path) {
      const { quasis, expressions } = path.node
      let hasChineseText = false

      quasis.forEach((quasi) => {
        if (isChineseChar(quasi.value.raw)) {
          hasChineseText = true
        }
      })

      if (hasChineseText) {
        const text = processTemplateText(generate(path.node).code, expressions)
        tokens.push({
          type: 'template',
          text,
          start: path.node.start,
          end: path.node.end,
          path,
          params: expressions.map((exp) => ({
            name: simplifyExpression(generate(exp).code),
            expression: generate(exp).code,
            start: exp.start,
            end: exp.end
          }))
        })
      }
    },
    JSXText(path) {
      // 检查相邻的 JSX 表达式
      let text = path.node.value.trim()
      if (!text || !isChineseChar(text)) return

      // 获取所有相邻的文本和表达式
      const elements = []
      let current = path

      // 向前查找
      while (current.getPrevSibling().node) {
        current = current.getPrevSibling()
        if (t.isJSXText(current.node)) {
          const value = current.node.value.trim()
          if (!value) continue
          if (!isChineseChar(value)) break
          elements.unshift({ type: 'text', value })
        } else if (t.isJSXExpressionContainer(current.node)) {
          elements.unshift({
            type: 'expression',
            value: simplifyExpression(generate(current.node.expression).code)
          })
        } else {
          break
        }
      }

      // 添加当前节点
      elements.push({ type: 'text', value: text })

      // 向后查找
      current = path
      while (current.getNextSibling().node) {
        current = current.getNextSibling()
        if (t.isJSXText(current.node)) {
          const value = current.node.value.trim()
          if (!value) continue
          if (!isChineseChar(value)) break
          elements.push({ type: 'text', value })
        } else if (t.isJSXExpressionContainer(current.node)) {
          elements.push({
            type: 'expression',
            value: simplifyExpression(generate(current.node.expression).code)
          })
        } else {
          break
        }
      }

      // 合并所有元素
      const combinedText = elements.map((el) => (el.type === 'text' ? el.value : `{${el.value}}`)).join('')
      const params = elements
        .filter((el) => el.type === 'expression')
        .map((el) => ({
          name: el.value,
          expression: el.value
        }))

      if (combinedText) {
        if (params.length) {
          tokens.push({
            type: 'template',
            text: combinedText,
            start: path.node.start,
            end: path.node.end,
            origin: path,
            params: params
          })
        } else {
          tokens.push({
            type: 'text',
            text: combinedText,
            start: path.node.start,
            end: path.node.end
          })
        }
      }
    }
  })

  return tokens
}
