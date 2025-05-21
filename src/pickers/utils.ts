import { REGEX_MAP } from '@/constants'
import { Scanner, Global } from '@/plugins'
import { replace } from '@/utils'

// const chinese = /\S*[^\x00-\xff]+\S*/g
const vname = /^[a-zA-Z\$_][a-zA-Z\d_]*$/
// const variable = /\{\{?([^{}]+)\}?\}/g

// 需要查找的关键字
const KEYWORD = [
  "'",
  '`',
  '{{',
  '}}',
  '${',
  '{',
  '}',
  '"',
  '(',
  ')',
  '//',
  '/**',
  '*/',
  '\r\n',
  '\n',
  '\r',
]

const MATCH_KEYWORD = {
  "'": "'",
  '"': '"',
  '`': '`',
  '${': '}',
  '{': '}',
  '(': ')',
  '{{': '}}',
  '//': ['\r\n', '\n', '\r'],
  '/**': '*/',
}

export function isMatchLang(text: string) {
  const lang = Global.sourceLanguage as keyof typeof REGEX_MAP
  if (!REGEX_MAP[lang]) {
    throw new Error(`暂不支持 ${lang} 语言的替换`)
  }
  return new RegExp(REGEX_MAP[lang]).test(text)
}

export type MatchTokenType = 'text' | 'string' | 'template' | 'chars'

export type MatchToken =
  | {
      type: MatchTokenType
      text: string
      start: number
      end: number
      origin?: string
      params?: ExpressionParam[]
      tokens?: MatchToken[]
    }
  | {
      type: 'attribute'
      name: string
      value: string
      start: number
      end: number
      tokens: MatchToken[]
    }

export interface ExpressionParam {
  expression: string | null
  name: string
  start: number
  end: number
  origin: string
  tokens?: MatchToken[]
}

interface KeywordStackItem {
  keyword: string
  pos: number
}

export function pickI18n(template: string, offset = 0) {
  const scanner = new Scanner(template)
  // 返回结果
  const tokens: MatchToken[] = []
  // 匹配的关键字栈
  const keywordStack: KeywordStackItem[] = []
  let idx = 0
  let words
  // 关键字
  let keyword
  // 扫描所在位置
  let pos
  // 关键字匹配
  let matched
  // 是模版语法中的变量关键字
  let isExp = false
  // 模版字符所带的参数列表
  let params: ExpressionParam[] = []
  // 是否时注释，需要忽略跳过的文字
  let ignore = false
  // 已合并的token所在的idx
  let mergedIdx = -1
  // 查找关键字
  words = scanner.scanUtil(KEYWORD)
  // 没有查询到任何关键字或者关键字前包含中文，都按全段文字为中文处理
  if (
    !scanner.keyword ||
    (isMatchLang(words) && !['{{', '{'].includes(scanner.keyword))
  ) {
    matchLang(template, offset)
    return tokens
  }
  // 遍历字符串
  while (!scanner.eos()) {
    pos = scanner.pos
    keyword = scanner.keyword
    // 如果关键字前一个字符为转义符，则不是需要找的关键字，继续向后查询
    if (words.slice(-1) === '\\') {
      scanner.scan()
      words = scanner.scanUtil(KEYWORD)
      continue
    }
    matched = matchPairKeyword(keyword, pos)
    // 需要忽略注释及console.log的中文
    if (
      ['//', '/**'].includes(keyword) ||
      (keyword === '(' && words.includes('console.log'))
    ) {
      ignore = true
      scanner.scan()
      words = scanner.scanUtil(KEYWORD)
      continue
    }
    if (ignore) {
      ignore = !(matched && [')', '*/', '\r\n', '\n', '\r'].includes(keyword))
      scanner.scan()
      words = scanner.scanUtil(KEYWORD)
      continue
    }
    if (['${', '{', '{{'].includes(keyword)) {
      isExp = true
    }
    if (
      ['}', '}}'].includes(keyword) &&
      keywordStack.every((item) => !['${', '{', '{{'].includes(item.keyword))
    ) {
      isExp = false
    }
    if (matched) {
      const matchStart = matched.pos + matched.keyword.length
      const matchEnd = pos - keyword.length
      // 截取关键字直接的文案内容
      const matchText = template.slice(matchStart, matchEnd + 1)
      const originStart = matched.pos
      const originEnd = pos
      // 包含关键字的原始文案内容
      const originText = template.slice(originStart, originEnd + 1)
      if (isMatchLang(originText) && !isExp) {
        // 一个纯粹的字符串包含中文
        if (["'", '"', '`'].includes(matched.keyword) && !params.length) {
          tokens.push({
            type: 'string',
            text: matchText,
            start: offset + originStart,
            end: offset + originEnd,
            origin: originText,
          })
        }
        // ES6模版语法匹配
        if (keyword === '`' && params.length) {
          const text = replaceI18n(
            matchText,
            params.map((p) => ({
              ...p,
              start: p.start - matchStart,
              end: p.end - matchStart,
            })),
            (item) => getExpression(item.name)
          )
          tokens.push({
            type: 'template',
            text,
            start: offset + originStart,
            end: offset + originEnd,
            params,
            origin: originText,
          })
          params = []
        }
      }
      // ES6模板语法中的参数匹配
      if (
        (keyword === '}' && matched.keyword === '${') ||
        // 保证{}包裹的非注释的部分
        (!matchText.includes('/*') &&
          keyword === '}' &&
          matched.keyword === '{') ||
        (keyword === '}}' && matched.keyword === '{{')
      ) {
        const isSimple = vname.test(matchText.trim())
        const name = isSimple ? matchText : `value${idx++}`
        const value = isSimple ? null : matchText.trim()
        params.push({
          name,
          expression: value,
          start: originStart,
          end: originEnd,
          tokens: isSimple ? [] : pickI18n(value as string),
          origin: originText,
        })
      }
    }
    if (
      isMatchLang(words) &&
      keywordStack.every((item) => item.keyword !== '`') &&
      !["'", '"', '`'].includes(keyword)
    ) {
      matchLang(words, pos - words.length)
    }
    if (['\r\n', '\n', '\r'].includes(keyword)) {
      mergeTokens()
    }
    scanner.scan()
    words = scanner.scanUtil(KEYWORD)
  }
  // 匹配完之后有剩余的字符串也需要校验是否存在中文
  if (words && isMatchLang(words)) {
    matchLang(words, scanner.pos - words.length)
  }
  // 对剩余的内容进行合并
  mergeTokens()
  // 如果最后还有 params，说明是{ xxx }这种对象格式的被匹配为模版了，得把params里的内容拿出来
  if (params.length) {
    params.map((item) => {
      const offset = item.origin.indexOf(item.expression as string)
      tokens.push(
        ...(item?.tokens ?? []).map((t) => ({
          ...t,
          start: offset + t.start,
          end: offset + t.end,
        }))
      )
    })
  }
  return tokens

  // 匹配中文
  function matchLang(string: string, start: number) {
    const langReg = `/\\S*${REGEX_MAP[Global.sourceLanguage as keyof typeof REGEX_MAP]}+\\S*/g`
    const zhMatch = string.match(langReg)
    while (zhMatch && zhMatch.length) {
      const char = zhMatch.shift() as string
      const charStart = start + string.indexOf(char)
      tokens.push({
        type: 'text',
        text: char,
        start: offset + charStart,
        end: offset + charStart + char.length - 1,
        origin: char,
      })
    }
  }
  // 匹配
  function matchPairKeyword(keyword: string, pos: number) {
    const keyMatch = MATCH_KEYWORD[keyword as keyof typeof MATCH_KEYWORD]
    const len = keywordStack.length
    if (!len) {
      if (!keyMatch) return
      keywordStack.push({
        keyword,
        pos,
      })
      return
    }
    const last = keywordStack[len - 1]
    const lastKeyMatch =
      MATCH_KEYWORD[last.keyword as keyof typeof MATCH_KEYWORD]
    if (
      (typeof lastKeyMatch === 'string' && lastKeyMatch !== keyword) ||
      (Array.isArray(lastKeyMatch) && !lastKeyMatch.includes(keyword))
    ) {
      if (!keyMatch) return
      keywordStack.push({
        keyword,
        pos,
      })
      return
    } else {
      return keywordStack.pop()
    }
  }

  function mergeTokens() {
    if (!tokens.length || !params.length) return
    if (!tokens.some((item, idx) => item.type === 'text' && idx > mergedIdx))
      return
    // 合并token和params方便计算最小start和最大end
    const combined = [
      ...tokens.slice(mergedIdx + 1),
      ...params.map((p) => ({
        ...p,
        start: offset + p.start,
        end: offset + p.end,
      })),
    ]
    // 计算 start 和 end 范围
    const mergedStart = Math.min(...combined.map((item) => item.start))
    const mergedEnd = Math.max(...combined.map((item) => item.end))
    const mergedText = template.slice(
      mergedStart - offset,
      mergedEnd + 1 - offset
    )
    const text = replaceI18n(
      mergedText,
      params.map((p) => ({
        ...p,
        start: p.start - mergedStart,
        end: p.end - mergedStart,
      })),
      (item) => getExpression(item.name)
    )
    // 删除原来tokens中的内容
    tokens.splice(mergedIdx + 1, tokens.length)
    tokens.push({
      type: 'text',
      text,
      start: mergedStart,
      end: mergedEnd,
      params,
      origin: mergedText,
    })
    mergedIdx = tokens.length - 1
    // 清空原来params里的内容
    params = []
  }

  // 获取参数模板格式
  function getExpression(name: string) {
    return Global.expressionTmp.replace('expression', name)
  }
}

export function replaceI18n<K extends { start: number; end: number }>(
  origin: string,
  tokens: K[],
  callback: (item: K) => string
) {
  let code = origin
  let offset = 0
  // logger.debug('origin code:', origin)
  tokens.forEach((token) => {
    // logger.debug(`start: ${origin[token.start]}, end: ${origin[token.end]}`)
    code = replace(
      code,
      token.start + offset,
      token.end + offset,
      callback(token)
    )
    offset = code.length - origin.length
  })
  return code
}
