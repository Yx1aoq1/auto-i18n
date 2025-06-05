import { EXPR_FORMATS, KEY_STYLE, SourceLangKey } from '@/constants'
import { ExprFormat, KeyStyle, MatchLang } from '@/types'

export function isValidMatchLang(lang: string): lang is MatchLang {
  return Object.values(SourceLangKey)
    .filter((key) => key !== SourceLangKey.EN)
    .includes(lang as MatchLang)
}

export function isValidKeyStyle(style: string): style is KeyStyle {
  return KEY_STYLE.includes(style as KeyStyle)
}

export function isValidExprFormat(format: string): format is ExprFormat {
  return EXPR_FORMATS.includes(format as ExprFormat)
}
