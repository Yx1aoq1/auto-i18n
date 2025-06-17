import { ParsePathMatcher } from '@/utils'
import { uniq } from 'lodash'
import { extname } from 'path'
import { AvailableParsers } from '@/parsers'
import { Config } from './Config'

export class Global {
  // 可处理的文件拓展名
  static enableTransExts = ['vue', 'js', 'html', 'ts', 'jsx', 'tsx']

  // 私有的Config实例，延迟初始化
  private static _configInstance: Config | null = null

  // 获取Config实例，只有在真正需要时才创建
  private static getConfigInstance(): Config {
    if (!this._configInstance) {
      this._configInstance = new Config()
    }
    return this._configInstance
  }

  static get sourceLanguage() {
    return this.getConfigInstance().sourceLanguage
  }

  static get matchedLanguage() {
    return this.getConfigInstance().matchedLanguage
  }

  static get enabledParsers() {
    return AvailableParsers.filter((i) =>
      (
        this.getConfigInstance().enabledParsers || ['js', 'ts', 'json']
      ).includes(i.id)
    )
  }

  static get localesPaths() {
    return this.getConfigInstance().localesPaths
  }

  static get namespace() {
    return this.getConfigInstance().namespace || false
  }

  static get pathMatcher() {
    return this.getConfigInstance().pathMatcher
  }

  static get ignoreFiles() {
    return this.getConfigInstance().ignoreFiles
  }

  static get includeSubfolders() {
    return this.getConfigInstance().includeSubfolders
  }

  static getPathMatchers() {
    const rules = Array.isArray(this.pathMatcher)
      ? this.pathMatcher
      : [this.pathMatcher]
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

  static get keyStyle() {
    return this.getConfigInstance().keyStyle
  }

  static get exprFormat() {
    return this.getConfigInstance().exprFormat
  }

  static get useArrayExpr() {
    return this.getConfigInstance().useArrayExpr
  }

  static get caseStyle() {
    return this.getConfigInstance().caseStyle
  }

  static get i18nFuncTemp() {
    return this.getConfigInstance().i18nFuncTemp
  }

  // 提供一个方法来设置调试模式
  static set isDebugMode(value: boolean) {
    this.getConfigInstance().isDebugMode = value
  }

  static get isDebugMode() {
    return this.getConfigInstance().isDebugMode
  }
}
