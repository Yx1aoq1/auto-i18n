export const CONFIG_FILE_NAME = 'i18n.config.js'

export const TRANSLATE_MODES = ['vue', 'react', 'angular', undefined] as const

export const KEY_STYLE = ['flat', 'nested'] as const

export const VUE_TYPES = ['vueTemplate', 'vueScript', 'vueSetup'] as const

export const SourceLangKey = {
  ZH: 'zh-cn',
  EN: 'en',
  JA: 'ja',
  KO: 'ko',
  RU: 'ru',
} as const

export const REGEX_MAP = {
  [SourceLangKey.ZH]: '[\u4e00-\u9fff]',
  [SourceLangKey.EN]: '[a-zA-Z]',
  [SourceLangKey.JA]: '[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', // 日语假名和汉字
  [SourceLangKey.KO]: '[\uAC00-\uD7A3]', // 韩语字母
  [SourceLangKey.RU]: '[йцукенгшщзхъфывапролджэячсмитьбюё .-]{1,}', // 俄语字母
}
