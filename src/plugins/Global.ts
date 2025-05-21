import { ParsePathMatcher } from '@/utils'
import { uniq } from 'lodash'
import { extname } from 'path'
import { AvailableParsers } from '@/parsers'
import { Config } from './Config'

export class Global {
  // 可处理的文件拓展名
  static enableTransExts = ['vue', 'js', 'html', 'ts', 'jsx', 'tsx']

  static sourceLanguage = Config.sourceLanguage

  static enabledParsers = AvailableParsers.filter((i) =>
    (Config.enabledParsers || ['js', 'json']).includes(i.id)
  )

  static localesPaths = Config.localesPaths

  static namespace = Config.namespace || false

  static pathMatcher = Config.pathMatcher

  static ignoreFiles = Config.ignoreFiles

  static includeSubfolders = Config.includeSubfolders

  static translateMode = Config.translateMode

  static getPathMatchers() {
    const rules = Array.isArray(Config.pathMatcher)
      ? Config.pathMatcher
      : [Config.pathMatcher]
    const enabledParserExts = Global.enabledParsers
      .map((item) => item.id)
      .join('|')
    return uniq(rules).map((matcher) => ({
      regex: ParsePathMatcher(matcher, enabledParserExts),
      matcher,
    }))
  }
  static getMatchedParser(ext: string) {
    if (!ext.startsWith('.') && ext.includes('.')) ext = extname(ext)
    return Global.enabledParsers.find((parser) => parser.supports(ext))
  }

  static keyStyle = Config.keyStyle

  static expressionTmp = Config.expressionTmp

  static namespaceCaseStyle = Config.namespaceCaseStyle
}
