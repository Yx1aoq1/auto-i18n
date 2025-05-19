import { Scanner } from './scanner'
import { isChineseChar, codeReplace } from './common'
import { Global } from '../global'

const chinese = /\S*[^\x00-\xff]+\S*/g
const vname = /^[a-zA-Z\$_][a-zA-Z\d_]*$/
const variable = /\{\{?([^{}]+)\}?\}/g
// 需要查找的关键字
const KEYWORD = ["'", '`', '{{', '}}', '${', '{', '}', '"', '(', ')', '//', '/**', '*/', '\r\n', '\n', '\r']
const MATCH_KEYWORD = {
  "'": "'",
  '"': '"',
  '`': '`',
  '${': '}',
  '{': '}',
  '(': ')',
  '{{': '}}',
  '//': ['\r\n', '\n', '\r'],
  '/**': '*/'
}

export function parseTemplate(template, offset = 0) {
  const scanner = new Scanner(template)
  // 返回结果
  const tokens = []
  // 匹配的关键字栈
  const keywordStack = []
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
  let params = []
  // 是否时注释，需要忽略跳过的文字
  let ignore = false
  // 匹配中文起始点
  let chineseStart = 0
  // 查找关键字
  words = scanner.scanUtil(KEYWORD)
  // 没有查询到任何关键字或者关键字前包含中文，都按全段文字为中文处理
  if (!scanner.keyword || (isChineseChar(words) && !['{{', '{'].includes(scanner.keyword))) {
    matchChinese(template, offset)
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
    if (['//', '/**'].includes(keyword) || (keyword === '(' && words.includes('console.log'))) {
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
    // 当匹配到中文，开始处理
    if (isChineseChar(words)) {
      if (['${', '{', '{{'].includes(keyword)) {
        isExp = true
      }
      // 如果不是模版语法的关键字可以直接匹配
      if (!isExp && keywordStack.every((item) => item.keyword !== '`')) {
        matchChinese(words, pos - words.length)
      }
    }
    if (matched) {
      const matchText = template.slice(matched.pos + matched.keyword.length, pos)
      const end = scanner.pos + keyword.length
      if (isChineseChar(matchText) && !isExp) {
        // 一个纯粹的字符串包含中文
        if (["'", '"', '`'].includes(matched.keyword) && !params.length) {
          tokens.push({
            type: 'string',
            text: token,
            start: offset + matched.pos,
            end: offset + end
          })
        }
        // ES6模版语法匹配
        if (keyword === '`' && params.length) {
          const text = codeReplace(matchText, params, (item) => getParamTemplate(item.name))
          tokens.push({
            type: 'template',
            text,
            start: offset + matched.pos,
            end: offset + end,
            params,
            origin: token
          })
          params = []
        }
      }
      // ES6模板语法中的参数匹配
      /* prettier-ignore */
      if (
        (keyword === '}' && matched.keyword === '${') ||
        // 保证{}包裹的非注释的部分
        (!token.includes('/**') && keyword === '}' && matched.keyword === '{') ||
        (keyword === '}}' && matched.keyword === '{{')
      ) {
        const isSimple = vname.test(token.trim())
        const name = isSimple ? token : `value${idx++}`
        const value = isSimple ? null : token.trim()
        params.push({
          name,
          expression: value,
          start: matched.pos,
          end,
          tokens: isSimple ? [] : parseTemplate(value)
        })
        isExp = false
      }
    }
    scanner.scan()
    words = scanner.scanUtil(KEYWORD)
  }
  // 匹配完之后有剩余的字符串也需要校验是否存在中文
  if (words && isChineseChar(words)) {
    matchChinese(words, scanner.pos - words.length)
  }
  return tokens

  function matchChinese(string, start) {
    const zhMatch = string.match(chinese)
    while (zhMatch && zhMatch.length) {
      const char = zhMatch.shift()
      start = offset + start + string.indexOf(char)
      tokens.push({
        type: 'text',
        text: char,
        start,
        end: offset + start + char.length
      })
    }
  }

  function matchPairKeyword(keyword, pos) {
    const keyMatch = MATCH_KEYWORD[keyword]
    const len = keywordStack.length
    if (!len) {
      if (!keyMatch) return
      keywordStack.push({
        keyword,
        pos
      })
      return
    }
    const last = keywordStack[len - 1]
    const lastKeyMatch = MATCH_KEYWORD[last.keyword]
    if ((typeof lastKeyMatch === 'string' && lastKeyMatch !== keyword) || (Array.isArray(lastKeyMatch) && !lastKeyMatch.includes(keyword))) {
      if (!keyMatch) return
      keywordStack.push({
        keyword,
        pos
      })
      return
    } else {
      return keywordStack.pop()
    }
  }

  // 获取参数模板格式
  function getParamTemplate(name) {
    return Global.paramTemplate.replace('expression', name)
  }
}
