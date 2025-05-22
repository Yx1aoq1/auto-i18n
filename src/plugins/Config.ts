import { CONFIG_FILE_NAME, SourceLangKey } from '@/constants'
import fs from 'fs'
import path from 'path'
import { trimEnd } from 'lodash'
import { KeyStyle, VueExtType } from '@/types'
import { CaseStyles } from '@/utils'
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
  // 私有缓存变量
  static #configCache: Record<string, unknown> | null = null

  // 私有加载方法，只加载一次
  private static loadConfig(): Record<string, unknown> {
    if (this.#configCache) return this.#configCache

    const configPath = path.join(cwd, CONFIG_FILE_NAME)
    if (!fs.existsSync(configPath)) {
      logger.error(
        `配置文件不存在，请在项目根目录下新增 ${CONFIG_FILE_NAME} 文件！`
      )
      process.exit(1)
    }

    delete require.cache[require.resolve(configPath)]
    this.#configCache = require(configPath)

    return this.#configCache as Record<string, unknown>
  }

  private static getConfig<T = unknown>(key: string): T | undefined {
    const config = this.loadConfig()
    return config[key] as T | undefined
  }

  // 默认匹配识别的语言
  static get sourceLanguage(): string {
    return this.getConfig<string>('sourceLanguage') || SourceLangKey.ZH
  }

  // 读取locales配置时对应的拓展名
  static get enabledParsers(): string[] | undefined {
    let ids = this.getConfig<string | string[]>('enabledParsers')
    if (!ids || !ids.length) return undefined
    if (typeof ids === 'string') ids = [ids]
    return ids
  }

  // locales配置的文件夹路径
  static get localesPaths(): string[] | undefined {
    const paths = this.getConfig<string | string[]>('localesPaths')
    let localesPaths: string[]
    if (!paths) return
    else if (typeof paths === 'string') localesPaths = paths.split(',')
    else localesPaths = paths
    if (!localesPaths) return
    return localesPaths.map((i) => trimEnd(i, '/\\').replace(/\\/g, '/'))
  }

  // 是否有命名空间
  static get namespace(): boolean | undefined {
    return this.getConfig<boolean>('namespace')
  }

  // locales文件匹配
  static get pathMatcher(): string | undefined {
    return this.getConfig('pathMatcher')
  }

  // i18n/locales目录忽略读取的文件夹
  static get ignoreFiles() {
    return this.getConfig<string[]>('ignoreFiles') ?? []
  }

  // 包含的文件夹层级
  static get includeSubfolders(): boolean {
    return this.getConfig<boolean>('includeSubfolders') || false
  }

  // 导出格式 Can be flat({"a.b.c": "..."}) or nested({"a": {"b": {"c": "..."}}})
  static get keyStyle(): KeyStyle {
    const style = this.getConfig<KeyStyle>('keystyle') || 'auto'
    if (style === 'auto') return 'flat'
    return style
  }

  // 参数模板格式，expression 表示中间要替换的参数名称，例如： {{expression}} / ${expression}
  static get expressionTmp() {
    return this.getConfig<string>('expressionTmp') ?? '{expression}'
  }

  // 命名空间风格，如大写驼峰/小写驼峰等，会自动转换
  static get caseStyle() {
    return this.getConfig<CaseStyles>('caseStyle') ?? 'default'
  }

  // 国际化的i18n方法 如 i18n.t(${key})
  static get i18nFuncTemp() {
    return (
      this.getConfig<string | ((opt: I18nFuncParams) => string)>(
        'i18nFuncTemp'
      ) ?? 'i18n.$t(${key})'
    )
  }
}
