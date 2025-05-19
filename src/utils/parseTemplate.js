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
  // 是否可以合并为一整串替换字符（带换行的不合并）
  let canMerged = true
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
    if (['\r\n', '\n', '\r'].includes(keyword)) {
      canMerged = false
    }
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
    if (['}', '}}'].includes(keyword)) {
      isExp = false
    }

    if (matched) {
      const matchText = template.slice(matched.pos + matched.keyword.length, pos)
      console.log('🚀 ~ matchText:', matchText)
      const start = matched.pos - matched.keyword.length + 1
      const end = pos
      if (isChineseChar(matchText)) {
        // 一个纯粹的字符串包含中文
        if (["'", '"', '`'].includes(matched.keyword) && !params.length) {
          tokens.push({
            type: 'string',
            text: matchText,
            start: offset + start,
            end: offset + end
          })
        }
        // ES6模版语法匹配
        if (keyword === '`' && params.length) {
          tokens.push({
            type: 'template',
            text: codeReplace(matchText, params, (item) => getParamTemplate(item.name)),
            start: offset + start,
            end: offset + end,
            params,
            origin: matchText
          })
          params = []
        }
      }
      // ES6模板语法中的参数匹配
      /* prettier-ignore */
      if (
        (keyword === '}' && matched.keyword === '${') ||
        // 保证{}包裹的非注释的部分
        (!matchText.includes('/**') && keyword === '}' && matched.keyword === '{') ||
        (keyword === '}}' && matched.keyword === '{{')
      ) {
        const isSimple = vname.test(matchText.trim())
        const name = isSimple ? matchText : `value${idx++}`
        const value = isSimple ? null : matchText.trim()
        params.push({
          name,
          expression: value,
          start,
          end,
          tokens: isSimple ? [] : parseTemplate(value),
          origin: matched.keyword + matchText + keyword
        })
      }
    } else {
      /* prettier-ignore */
      if (
        !isExp &&
        isChineseChar(words) &&
        keywordStack.every((item) => item.keyword !== '`') && keyword !== '`'
      ) {
        matchChinese(words, pos - words.length)
      }
    }
    if (['${', '{', '{{'].includes(keyword)) {
      isExp = true
    }
    scanner.scan()
    words = scanner.scanUtil(KEYWORD)
  }
  // 匹配完之后有剩余的字符串也需要校验是否存在中文
  if (words && isChineseChar(words)) {
    matchChinese(words, scanner.pos - words.length)
  }
  // 如果存在模板匹配，则重新计算tokens
  if (params.length && canMerged) {
    // 合并token和params方便计算最小start和最大end
    /* prettier-ignore */
    const combined = [
      ...tokens,
      ...params.map((p) => ({ ...p, start: offset + p.start, end: offset + p.end }))
    ]
    // 计算 start 和 end 范围
    const mergedStart = Math.min(...combined.map((item) => item.start))
    const mergedEnd = Math.max(...combined.map((item) => item.end))
    const mergedText = template.slice(mergedStart - offset, mergedEnd - offset)
    // 删除原来tokens中的内容
    tokens.splice(0, tokens.length)
    tokens.push({
      type: 'text',
      text: codeReplace(mergedText, params, (item) => getParamTemplate(item.name)),
      start: mergedStart,
      end: mergedEnd,
      params,
      origin: mergedText
    })
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
