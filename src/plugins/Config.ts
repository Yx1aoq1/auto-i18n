import { CONFIG_FILE_NAME, SourceLangKey } from '@/constants'
import fs from 'fs'
import path from 'path'
import { trimEnd } from 'lodash'
import { ExprFormat, KeyStyle, VueExtType } from '@/types'
import {
  CaseStyles,
  isValidExprFormat,
  isValidKeyStyle,
  normalizeLocale,
} from '@/utils'
import { MatchToken } from '@/transform'

interface I18nFuncParams {
  text: string
  key: string
  extname: string
  type: MatchToken['type']
  ext?: VueExtType
}

const cwd = process.cwd()

export class Config {
  // 实例缓存变量
  private configCache: Record<string, unknown>

  constructor() {
    this.configCache = this.loadConfig()
  }

  // 加载配置文件
  private loadConfig(): Record<string, unknown> {
    const configPath = path.join(cwd, CONFIG_FILE_NAME)
    if (!fs.existsSync(configPath)) {
      logger.error(
        `配置文件不存在，请在项目根目录下新增 ${CONFIG_FILE_NAME} 文件！`
      )
      process.exit(1)
    }

    delete require.cache[require.resolve(configPath)]
    return require(configPath)
  }

  private getConfig<T = unknown>(key: string): T | undefined {
    return this.configCache[key] as T | undefined
  }

  // 源语言
  get sourceLanguage(): string {
    return this.getConfig<string>('sourceLanguage') ?? SourceLangKey.ZH
  }

  // 默认匹配识别的语言
  get matchedLanguage(): string {
    return normalizeLocale(this.sourceLanguage)
  }

  // 读取locales配置时对应的拓展名
  get enabledParsers(): string[] | undefined {
    let ids = this.getConfig<string | string[]>('enabledParsers')
    if (!ids || !ids.length) return undefined
    if (typeof ids === 'string') ids = [ids]
    return ids
  }

  // locales配置的文件夹路径
  get localesPaths(): string[] | undefined {
    const paths = this.getConfig<string | string[]>('localesPaths')
    let localesPaths: string[]
    if (!paths) return
    else if (typeof paths === 'string') localesPaths = paths.split(',')
    else localesPaths = paths
    if (!localesPaths) return
    return localesPaths.map((i) => trimEnd(i, '/\\').replace(/\\/g, '/'))
  }

  // 是否有命名空间
  get namespace(): boolean | undefined {
    return this.getConfig<boolean>('namespace')
  }

  // locales文件匹配
  get pathMatcher(): string | undefined {
    return this.getConfig('pathMatcher')
  }

  // i18n/locales目录忽略读取的文件夹
  get ignoreFiles() {
    return this.getConfig<string[]>('ignoreFiles') ?? []
  }

  // 包含的文件夹层级
  get includeSubfolders(): boolean {
    return this.getConfig<boolean>('includeSubfolders') || false
  }

  // 导出格式 Can be flat({"a.b.c": "..."}) or nested({"a": {"b": {"c": "..."}}})
  get keyStyle(): KeyStyle {
    const style = this.getConfig<KeyStyle>('keystyle') ?? 'auto'
    if (isValidKeyStyle(style)) return style
    return 'flat'
  }

  // 参数模板格式，braces 表示 {expression} / doubleBraces 表示 {{expression}} / dollarBraces 表示 ${expression}
  // 也可以传入一个函数，根据参数名称和索引生成模板，例如：(name, idx) => `{${name}${idx}}`
  get exprFormat() {
    const format =
      this.getConfig<ExprFormat | ((name: string, idx: number) => string)>(
        'exprFormat'
      ) ?? 'braces'

    if (typeof format === 'function' || isValidExprFormat(format)) {
      return format
    }

    return 'braces'
  }

  // 参数是否以数组的形式传入
  get useArrayExpr(): boolean {
    return this.getConfig<boolean>('useArrayExpr') ?? false
  }

  // 命名空间风格，如大写驼峰/小写驼峰等，会自动转换
  get caseStyle() {
    return this.getConfig<CaseStyles>('caseStyle') ?? 'default'
  }

  // 国际化的i18n方法 如 i18n.t({key})
  get i18nFuncTemp() {
    return (
      this.getConfig<string | ((opt: I18nFuncParams) => string)>(
        'i18nFuncTemp'
      ) ?? 'i18n.$t({key})'
    )
  }

  set isDebugMode(value: boolean) {
    this.configCache.isDebugMode = value
  }

  get isDebugMode() {
    return this.getConfig<boolean>('isDebugMode') ?? false
  }
}
