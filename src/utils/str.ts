import { SourceLangKey } from '@/constants'

/**
 * 随机字符串
 */
export function getRandomStr() {
  return Math.random().toString(36).slice(2)
}

/**
 * 将文本start-end处的文本替换为replace
 * @param {*} soure
 * @param {*} start
 * @param {*} end
 * @param {*} replace
 * @returns
 */
export function replace(
  source: string,
  start: number,
  end: number,
  replace: string
) {
  return source.slice(0, start) + replace + source.slice(end + 1)
}

/**
 * 判断是否包含中文字符
 */
export function isChineseChar(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str)
}

/**
 * 标准化语言
 */
export function normalizeLocale(locale: string): string {
  const normalized = locale.toLowerCase().replace('_', '-')

  if (normalized.includes('zh')) return SourceLangKey.ZH
  if (normalized.includes('en')) return SourceLangKey.EN
  if (normalized.includes('ja') || normalized.includes('jp'))
    return SourceLangKey.JA
  if (normalized.includes('ko') || normalized.includes('kr'))
    return SourceLangKey.KO
  if (normalized.includes('ru') || normalized.includes('rus'))
    return SourceLangKey.RU

  return locale
}
