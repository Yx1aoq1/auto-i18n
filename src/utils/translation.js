import fs from 'fs'
import { Global } from '../global'
import { getExtname, transformCase } from './common'
import { travelDir, getPathLevel, getPathByLevel } from './fs'
import { Translator } from '../translator'

/**
 * 处理文件或目录的翻译
 * @param {string} filepath - 文件或目录路径
 * @param {Object} options - 配置选项
 * @param {string} [options.namespace] - 命名空间
 * @param {boolean} [options.auto] - 是否自动提取namespace
 * @param {boolean} [options.replace] - 是否替换原文件
 * @throws {Error} 当文件或目录不存在时抛出错误
 */
export async function processTranslation(filepath, options = {}) {
  const { namespace, auto = false, replace = false } = options

  // 验证目录存在
  try {
    fs.accessSync(filepath, fs.constants.F_OK)
  } catch (error) {
    logger.error(`${filepath}文件或目录不存在`)
    process.exit()
  }

  const translator = await Translator.create()
  const extname = getExtname(filepath)

  // 单文件处理
  if (Global.enableTransExts.includes(extname)) {
    // 单文件时，设置自动提取namespace，默认提取文件的上一级文件夹名称
    const _namespace = transformCase(
      auto ? namespace || getPathByLevel(filepath, -2) : namespace,
      Global.namespaceStyle
    )
    translator.translate(filepath, _namespace, replace)
    translator.getLocales(_namespace)
  } else {
    const level = getPathLevel(filepath)
    // 文件夹处理
    travelDir(filepath, (path) => {
      const ext = getExtname(path)
      // 文件夹处理时，设置自动提取namespace，默认提取输入文件夹的下一级文件夹名称
      const _namespace = transformCase(
        auto ? namespace || getPathByLevel(path, level + 1) : namespace,
        Global.namespaceStyle
      )
      if (Global.enableTransExts.includes(ext)) {
        translator.translate(path, _namespace, replace)
        translator.getLocales(_namespace)
      }
    })
  }
}
