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
