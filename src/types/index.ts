/**
 * 项目公共类型声明
 */
import { KEY_STYLE, TRANSLATE_MODES, VUE_TYPES } from '@/constants'
import { Command } from 'commander'

export type CommandModule = (program: Command) => void

export type TranslateMode = (typeof TRANSLATE_MODES)[number]

export type KeyStyle = (typeof KEY_STYLE)[number]

export type VueExtType = (typeof VUE_TYPES)[number]

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
