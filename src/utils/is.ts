import { KEY_STYLE, SourceLangKey } from '@/constants'
import { KeyStyle, SourceLang } from '@/types'

export function isValidSourceLang(lang: string): lang is SourceLang {
  return Object.values(SourceLangKey).includes(lang as SourceLang)
}

export function isValidKeyStyle(style: string): style is KeyStyle {
  return KEY_STYLE.includes(style as KeyStyle)
}
