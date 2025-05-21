import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

/**
 * 解析代码为 AST
 * @param {string} code 源代码
 * @param {string} type 文件类型
 * @returns {Object} AST
 */
function parseToAST(code, type) {
  const plugins = [
    'jsx',
    ['typescript', { isTSX: type === 'tsx' }],
    'classProperties',
    'decorators-legacy',
  ]

  return parser.parse(code, {
    sourceType: 'module',
    plugins,
  })
}

export function parseScript(code, type) {
  const ast = parseToAST(code, type)
  const tokens = []
  let matchEnd = 0
  traverse(ast, {
    StringLiteral(path) {
      if (matchEnd > path.node.start) return
      if (isChineseChar(path.node.value)) {
        // Check if this string is part of a JSX attribute
        const isJSXAttribute =
          path.parent && path.parent.type === 'JSXAttribute'
        if (isJSXAttribute) {
          tokens.push({
            type: 'attribute',
            name: path.parent.name.name,
            start: path.parent.start,
            end: path.parent.end - 1,
            value: path.node.value,
            tokens: parseTemplate(path.node.value),
          })
        } else {
          // 检查是否在 JSX 表达式中，但不在 JSX 属性内
          const isInJSXExpression = path.findParent(
            (p) => p.type === 'JSXExpressionContainer'
          )
          const isInJSXAttribute = path.findParent(
            (p) => p.type === 'JSXAttribute'
          )
          if (!isInJSXExpression || isInJSXAttribute) {
            tokens.push({
              type: 'string',
              text: path.node.value,
              start: path.node.start,
              end: path.node.end - 1,
            })
          }
        }
        matchEnd = path.node.end
      }
    },
    TemplateLiteral(path) {
      if (matchEnd > path.node.start) return
      const hasChineseText = path.node.quasis.some((quasi) => {
        return isChineseChar(quasi.value.raw)
      })

      if (hasChineseText) {
        tokens.push(...parseTemplate(generate(path.node).code, path.node.start))
        matchEnd = path.node.end
      }
    },
    JSXText(path) {
      // 检查相邻的 JSX 表达式
      const text = path.node.value
      if (!text || !isChineseChar(text)) return

      // 获取当前节点的完整文本内容
      let start = path.node.start
      let end = path.node.end

      // 已处理过，跳过
      if (matchEnd > start) return

      // 检查相邻的 JSX 表达式节点
      const siblings = path.parent.children
      const currentIndex = siblings.indexOf(path.node)
      // 记录文本
      let completeText = text

      // 向前查找相邻的 JSX 表达式
      for (let i = currentIndex - 1; i >= 0; i--) {
        const sibling = siblings[i]
        if (sibling.type === 'JSXExpressionContainer') {
          const exprText = generate(sibling).code
          completeText = exprText + completeText
          start = Math.min(start, sibling.start)
        } else if (sibling.type === 'JSXText') {
          completeText = sibling.value + completeText
          start = Math.min(start, sibling.start)
        } else {
          break
        }
      }

      // 向后查找相邻的 JSX 表达式
      for (let i = currentIndex + 1; i < siblings.length; i++) {
        const sibling = siblings[i]
        if (sibling.type === 'JSXExpressionContainer') {
          const exprText = generate(sibling).code
          completeText = completeText + exprText
          end = Math.max(end, sibling.end)
        } else if (sibling.type === 'JSXText') {
          completeText = completeText + sibling.value
          end = Math.max(end, sibling.end)
        } else {
          break
        }
      }
      // 更新 matchEnd 为实际处理的最后一个节点的结束位置
      matchEnd = end
      tokens.push({
        type: 'chars',
        text: completeText,
        start: start,
        end: end - 1,
        tokens: parseTemplate(completeText),
      })
    },
  })

  return tokens
}
