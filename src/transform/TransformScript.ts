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
  const resolved: t.Node[] = []

  // 检查节点是否已经被处理过
  function isNodeResolved(path: NodePath<any>): boolean {
    // 检查当前节点
    if (resolved.includes(path.node)) return true

    // 检查父节点链
    let parentPath = path.parentPath
    while (parentPath) {
      if (resolved.includes(parentPath.node)) return true
      parentPath = parentPath.parentPath
    }

    // 检查子节点（针对JSX父节点已处理的情况）
    for (const node of resolved) {
      if (t.isJSXElement(node)) {
        const children = node.children || []
        if (children.includes(path.node)) return true
      }
    }

    return false
  }

  traverse(ast, {
    StringLiteral(path: NodePath<t.StringLiteral>) {
      if (!path.node.start || !path.node.end) return
      if (isNodeResolved(path)) return
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
          tokens.push({
            type: 'string',
            text: path.node.value,
            start: path.node.start,
            end: path.node.end - 1,
          })
        }
        resolved.push(path.node)
      }
    },
    TemplateLiteral(path: NodePath<t.TemplateLiteral>) {
      if (!path.node.start || !path.node.end) return
      if (isNodeResolved(path)) return
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
        resolved.push(path.node)
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
      if (isNodeResolved(path)) return

      // 检查相邻的 JSX 表达式节点
      const parent = path.parent as t.JSXElement
      const siblings = parent.children || []
      const currentIndex = siblings.indexOf(path.node)
      // 记录文本
      let completeText = text

      // 收集需要处理的所有相邻节点
      const processedNodes: t.Node[] = [path.node]

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
          processedNodes.push(sibling)
        } else if (sibling.type === 'JSXText' && sibling.start) {
          completeText = sibling.value + completeText
          start = Math.min(start, sibling.start)
          processedNodes.push(sibling)
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
          processedNodes.push(sibling)
        } else if (sibling.type === 'JSXText' && sibling.end) {
          completeText = completeText + sibling.value
          end = Math.max(end, sibling.end)
          processedNodes.push(sibling)
        } else {
          break
        }
      }

      // 将所有处理过的节点加入到resolved数组
      resolved.push(...processedNodes)

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
