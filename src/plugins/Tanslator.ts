import { getExtname, isDirectory } from '@/utils'
import { Global, LocaleLoader } from '.'
import fs from 'fs'

export class Translator {
  static async create() {
    const localeLoader = new LocaleLoader(process.cwd())
    await localeLoader.init()
    return new Translator(localeLoader)
  }

  constructor(public readonly localeLoader: LocaleLoader) {}

  translate(filepath: string, opt: { namespace?: string; replace?: boolean }) {
    const { namespace, replace = false } = opt
    const extname = getExtname(filepath)
    if (extname && !Global.enableTransExts.includes(extname)) {
      logger.warn(`暂不支持.${extname}的文件，已跳过`)
      return
    }
  }
}
