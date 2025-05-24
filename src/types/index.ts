/**
 * 项目公共类型声明
 */
import { KEY_STYLE, VUE_TYPES, SourceLangKey } from '@/constants'
import { Command } from 'commander'

export type CommandModule = (program: Command) => void

export type KeyStyle = (typeof KEY_STYLE)[number]

export type VueExtType = (typeof VUE_TYPES)[number]

export type SourceLang = (typeof SourceLangKey)[keyof typeof SourceLangKey]

export interface FileInfo {
  filepath: string
  dirpath: string
  locale: string
  readonly?: boolean
  namespace?: string
  matcher?: string
}

type NestedStringValue = string | { [key: string]: NestedStringValue }

export type LocaleData = Record<string, NestedStringValue>

export interface ParsedFile extends FileInfo {
  value: LocaleData
}
