import fs from 'fs'
import path from 'path'

/**
 * 创建文件目录，确保文件目录存在
 * @param {string} filePath
 */
export function ensureDirectoryExistence(filePath: string): boolean {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
  return true
}

/**
 * 判断当前目录是否是文件夹
 * @param {string} filepath
 */
export function isDirectory(filepath: string): boolean {
  return fs.statSync(filepath).isDirectory()
}

/**
 * 导出文件到指定位置
 * @param {string} filepath
 * @param {string | Buffer} buffer
 * @param {fs.WriteFileOptions} options
 */
export function exportFile(
  filepath: string,
  buffer: string | Buffer,
  options?: fs.WriteFileOptions
): void {
  // 确保目录存在
  ensureDirectoryExistence(filepath)
  return fs.writeFileSync(filepath, buffer, options)
}

/**
 * 遍历文件夹
 */
export function travelDir(
  src: string,
  callback: (filepath: string) => void
): void {
  fs.readdirSync(src).forEach((filename) => {
    // 判断是否为文件夹
    const filepath = path.join(src, filename)
    if (isDirectory(filepath)) {
      travelDir(filepath, callback)
    } else {
      callback(filepath)
    }
  })
}

/**
 * 获取文件路径层级
 * @param {string} filepath - 文件或文件夹路径
 * @returns {number}
 */
export function getPathLevel(filepath: string): number {
  // 统一路径分隔符为正斜杠
  const normalizedPath = filepath.replace(/\\/g, '/')
  // 分割路径
  const parts = normalizedPath.split('/').filter(Boolean)

  return parts.length
}

/**
 * 获取文件路径的指定层级
 * @param {string} filepath - 文件或文件夹路径
 * @param {number} level - 要获取的层级，正数从前往后数，负数从后往前数
 * @returns {string|undefined} 返回指定层级的路径名，如果超出范围则返回undefined
 */
export function getPathByLevel(
  filepath: string,
  level: number
): string | undefined {
  // 统一路径分隔符为正斜杠
  const normalizedPath = filepath.replace(/\\/g, '/')
  // 分割路径
  const parts = normalizedPath.split('/').filter(Boolean)

  // 处理负数索引
  if (level < 0) {
    level = parts.length + level + 1
  }

  // 检查索引是否在有效范围内
  if (level < 0 || level >= parts.length) {
    return undefined
  }

  return parts[level - 1]
}
