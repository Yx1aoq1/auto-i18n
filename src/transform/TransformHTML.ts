import { VueExtType } from '@/types'
import { isMatchLang, MatchToken, pickI18n, replaceI18n } from './utils'
import { parseHTML } from '@/vendor/parseHTML'

export function TransformHTML(
  code: string | undefined,
  replace: (token: MatchToken, origin: string, ext?: VueExtType) => string,
  ext?: VueExtType
) {
  const tokens: MatchToken[] = []

  if (!code) return

  parseHTML(code, {
    expectHTML: true,
    shouldKeepComment: false,
    start(tag: any, attrs: any[]) {
      if (attrs && attrs.length) {
        attrs.map((attr) => {
          const origin = code.slice(attr.start, attr.end)
          // 修正起始位置
          const start = origin.indexOf(attr.name)
          if (isMatchLang(attr.value)) {
            tokens.push({
              type: 'attribute',
              ...attr,
              start: attr.start + start,
              end: attr.end - 1,
              tokens: pickI18n(attr.value),
            })
          }
        })
      }
    },
    chars(text: string, start: number, end: number) {
      if (isMatchLang(text)) {
        tokens.push({
          type: 'chars',
          text,
          start,
          end: end - 1,
          tokens: pickI18n(text),
        })
      }
    },
  })

  const newCode = replaceI18n(code, tokens, (t, o) => replace(t, o, ext))

  return {
    origin: code,
    tokens,
    result: newCode,
  }
}
