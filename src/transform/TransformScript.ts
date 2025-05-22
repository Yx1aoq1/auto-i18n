import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import { VueExtType } from '@/types'
import { isMatchLang, MatchToken, pickI18n, replaceI18n } from './utils'

type PluginConfig = parser.ParserPlugin

/**
 * 解析代码为 AST
 * @param {string} code 源代码
 * @param {string} type 文件类型
 * @returns {Object} AST
 */
function parseToAST(code: string, type: string) {
  const plugins: PluginConfig[] = [
    'jsx',
    ['typescript', { isTSX: type === 'tsx' } as parser.TypeScriptPluginOptions],
    'classProperties',
    'decorators-legacy',
  ]

  return parser.parse(code, {
    sourceType: 'module',
    plugins,
  })
}

export function TransformScript(
  code: string | undefined,
  type: string,
  replace: (token: MatchToken, origin: string, ext?: VueExtType) => string,
  ext?: VueExtType
) {
  if (!code) return

  const ast = parseToAST(code, type)
  const tokens: MatchToken[] = []
  let matchEnd = 0
  traverse(ast, {
    StringLiteral(path: NodePath<t.StringLiteral>) {
      if (!path.node.start || !path.node.end) return
      if (matchEnd > path.node.start) return
      if (isMatchLang(path.node.value)) {
        // Check if this string is part of a JSX attribute
        const isJSXAttribute =
          path.parent && path.parent.type === 'JSXAttribute'
        if (
          isJSXAttribute &&
          (path.parent as t.JSXAttribute).name &&
          path.parent.start &&
          path.parent.end
        ) {
          const parent = path.parent as t.JSXAttribute
          const name = parent.name as t.JSXIdentifier
          tokens.push({
            type: 'attribute',
            name: name.name,
            start: parent.start!,
            end: parent.end! - 1,
            value: path.node.value,
            tokens: pickI18n(path.node.value),
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
    TemplateLiteral(path: NodePath<t.TemplateLiteral>) {
      if (!path.node.start || !path.node.end) return
      if (matchEnd > path.node.start) return
      const hasChineseText = path.node.quasis.some(
        (quasi: t.TemplateElement) => {
          return isMatchLang(quasi.value.raw)
        }
      )

      if (hasChineseText) {
        tokens.push(
          ...pickI18n(generate(path.node).code).map((t) => ({
            ...t,
            start: t.start + path.node.start!,
            end: t.end + path.node.start!,
          }))
        )
        matchEnd = path.node.end
      }
    },
    JSXText(path: NodePath<t.JSXText>) {
      // 检查相邻的 JSX 表达式
      const text = path.node.value
      if (!text || !isMatchLang(text)) return

      // 获取当前节点的完整文本内容
      let start = path.node.start
      let end = path.node.end

      if (!start || !end) return

      // 已处理过，跳过
      if (matchEnd > start) return

      // 检查相邻的 JSX 表达式节点
      const parent = path.parent as t.JSXElement
      const siblings = parent.children || []
      const currentIndex = siblings.indexOf(path.node)
      // 记录文本
      let completeText = text

      // 向前查找相邻的 JSX 表达式
      for (let i = currentIndex - 1; i >= 0; i--) {
        const sibling = siblings[i]
        if (
          sibling.type === 'JSXExpressionContainer' &&
          sibling.start &&
          sibling.end
        ) {
          const exprText = generate(sibling).code
          completeText = exprText + completeText
          start = Math.min(start, sibling.start)
        } else if (sibling.type === 'JSXText' && sibling.start) {
          completeText = sibling.value + completeText
          start = Math.min(start, sibling.start)
        } else {
          break
        }
      }

      // 向后查找相邻的 JSX 表达式
      for (let i = currentIndex + 1; i < siblings.length; i++) {
        const sibling = siblings[i]
        if (
          sibling.type === 'JSXExpressionContainer' &&
          sibling.start &&
          sibling.end
        ) {
          const exprText = generate(sibling).code
          completeText = completeText + exprText
          end = Math.max(end, sibling.end)
        } else if (sibling.type === 'JSXText' && sibling.end) {
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
        tokens: pickI18n(completeText),
      })
    },
  })

  const newCode = replaceI18n(code, tokens, (t, o) => replace(t, o, ext))

  return {
    origin: code,
    tokens,
    result: newCode,
  }
}
