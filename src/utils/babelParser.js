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
export function parseToAST(code, type) {
  const plugins = ['jsx', ['typescript', { isTSX: type === 'tsx' }], 'classProperties', 'decorators-legacy']

  return parser.parse(code, {
    sourceType: 'module',
    plugins
  })
}

/**
 * 遍历 AST 查找中文字符串
 * @param {Object} ast AST
 * @returns {Array} 中文字符串数组
 */
export function findChineseText(ast) {
  const results = []

  traverse(ast, {
    StringLiteral(path) {
      if (isChineseChar(path.node.value)) {
        results.push({
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
        results.push({
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

      if (combinedText) {
        results.push({
          type: 'jsx',
          text: combinedText,
          start: path.node.start,
          end: path.node.end,
          path,
          params: elements
            .filter((el) => el.type === 'expression')
            .map((el) => ({
              name: el.value,
              expression: el.value
            }))
        })
      }
    }
  })

  return results
}

/**
 * 替换 AST 中的中文文本
 * @param {Object} ast AST
 * @param {Function} replacer 替换函数
 * @returns {string} 生成的代码
 */
export function replaceChineseText(ast, replacer) {
  // 记录已处理的节点，避免重复处理
  const processedNodes = new WeakSet()

  traverse(ast, {
    StringLiteral(path) {
      if (isChineseChar(path.node.value)) {
        try {
          const newValue = replacer({
            type: 'string',
            text: path.node.value,
            start: path.node.start,
            end: path.node.end
          })
          path.replaceWithSourceString(newValue)
        } catch (error) {
          console.error('替换字符串失败:', error)
        }
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
        try {
          const text = processTemplateText(generate(path.node).code, expressions)
          const newValue = replacer({
            type: 'template',
            text,
            start: path.node.start,
            end: path.node.end,
            params: expressions.map((exp) => ({
              name: simplifyExpression(generate(exp).code),
              expression: generate(exp).code,
              start: exp.start,
              end: exp.end
            }))
          })
          path.replaceWithSourceString(newValue)
        } catch (error) {
          console.error('替换模板字符串失败:', error)
        }
      }
    },
    JSXText(path) {
      // 如果已处理过，则跳过
      if (processedNodes.has(path.node)) return

      let text = path.node.value.trim()
      if (!text || !isChineseChar(text)) return

      // 获取所有相邻的文本和表达式
      const elements = []
      let current = path
      let startPath = path
      let endPath = path

      // 向前查找，限制最多查找10个相邻节点，避免无限循环
      let forwardCount = 0
      while (current.getPrevSibling().node && forwardCount < 10) {
        forwardCount++
        current = current.getPrevSibling()

        // 如果已处理过，则停止向前查找
        if (processedNodes.has(current.node)) break

        if (t.isJSXText(current.node)) {
          const value = current.node.value.trim()
          if (!value) continue
          if (!isChineseChar(value)) break
          elements.unshift({ type: 'text', value })
          startPath = current
          // 标记为已处理
          processedNodes.add(current.node)
        } else if (t.isJSXExpressionContainer(current.node)) {
          elements.unshift({
            type: 'expression',
            value: simplifyExpression(generate(current.node.expression).code)
          })
          startPath = current
          // 标记为已处理
          processedNodes.add(current.node)
        } else {
          break
        }
      }

      // 添加当前节点
      elements.push({ type: 'text', value: text })
      processedNodes.add(path.node)

      // 向后查找，限制最多查找10个相邻节点，避免无限循环
      let backwardCount = 0
      current = path
      while (current.getNextSibling().node && backwardCount < 10) {
        backwardCount++
        current = current.getNextSibling()

        // 如果已处理过，则停止向后查找
        if (processedNodes.has(current.node)) break

        if (t.isJSXText(current.node)) {
          const value = current.node.value.trim()
          if (!value) continue
          if (!isChineseChar(value)) break
          elements.push({ type: 'text', value })
          endPath = current
          // 标记为已处理
          processedNodes.add(current.node)
        } else if (t.isJSXExpressionContainer(current.node)) {
          elements.push({
            type: 'expression',
            value: simplifyExpression(generate(current.node.expression).code)
          })
          endPath = current
          // 标记为已处理
          processedNodes.add(current.node)
        } else {
          break
        }
      }

      // 合并所有元素
      const combinedText = elements.map((el) => (el.type === 'text' ? el.value : `{${el.value}}`)).join('')

      if (combinedText) {
        try {
          const newValue = replacer({
            type: 'jsx',
            text: combinedText,
            start: startPath.node.start,
            end: endPath.node.end,
            params: elements
              .filter((el) => el.type === 'expression')
              .map((el) => ({
                name: el.value,
                expression: el.value
              }))
          })

          // 处理 JSX 表达式
          let expression
          if (newValue.startsWith('{') && newValue.endsWith('}')) {
            // 如果已经包含花括号，去掉外层花括号再解析
            try {
              const innerExpr = newValue.slice(1, -1).trim()
              expression = parser.parseExpression(innerExpr)
            } catch (error) {
              console.error('解析JSX内部表达式失败:', error)
              // 直接使用字符串字面量作为后备方案
              expression = t.stringLiteral(combinedText)
            }
          } else {
            // 尝试直接解析表达式
            try {
              expression = parser.parseExpression(newValue)
            } catch (error) {
              console.error('解析JSX表达式失败:', error)
              // 直接使用字符串字面量作为后备方案
              expression = t.stringLiteral(combinedText)
            }
          }

          // 创建容器并替换
          const container = t.jsxExpressionContainer(expression)
          path.replaceWith(container)

          // 清理相邻的已处理节点
          let tempPath = startPath
          while (tempPath !== path) {
            if (tempPath.node) {
              const nextSibling = tempPath.getNextSibling()
              tempPath.remove()
              tempPath = nextSibling
            } else {
              break
            }
          }

          tempPath = endPath
          while (tempPath !== path) {
            if (tempPath.node) {
              const prevSibling = tempPath.getPrevSibling()
              tempPath.remove()
              tempPath = prevSibling
            } else {
              break
            }
          }
        } catch (error) {
          console.error('处理 JSX 节点失败:', error)
          // 如果处理失败，确保不会阻塞其他节点的处理`
        }
      }
    }
  })

  return generate(ast).code
}
