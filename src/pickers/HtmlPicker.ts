import { isMatchLang, MatchToken, pickI18n } from './utils'
import { parseHTML } from '@/vendor/parseHTML'

export function HtmlPicker(html?: string) {
  const tokens: MatchToken[] = []
  if (!html) return []

  parseHTML(html, {
    expectHTML: true,
    shouldKeepComment: false,
    start(tag: any, attrs: any[]) {
      if (attrs && attrs.length) {
        attrs.map((attr) => {
          if (isMatchLang(attr.value)) {
            tokens.push({
              type: 'attribute',
              ...attr,
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
  return tokens
}
