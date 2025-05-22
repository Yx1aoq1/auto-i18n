import { Parser } from './base'
import { File } from '@/plugins'
import * as esbuild from 'esbuild'

const LanguageIds = {
  js: 'javascript',
  ts: 'typescript',
} as const

const LanguageExts = {
  js: 'm?js',
  ts: 'ts',
} as const

export class EcmascriptParser extends Parser {
  readonly readonly = true

  constructor(public readonly id: 'js' | 'ts' = 'js') {
    super([LanguageIds[id]], LanguageExts[id])
  }

  async parse() {
    return {}
  }

  async dump(object: object): Promise<string> {
    let raw = JSON.stringify(object, null, 2)
    raw = `export default ${raw}`
    raw = raw
      .replace(/\"([\w_-]*)\":/g, '$1:')
      .replace(/:\s*\"(.*)\"/g, ": '$1'")
    return raw
  }

  async load(filepath: string) {
    const raw = await File.read(filepath)

    // 使用 esbuild 转换代码
    const result = await esbuild.transform(raw, {
      loader: this.id === 'ts' ? 'ts' : 'js',
      format: 'cjs',
    })

    // 创建一个临时的 CommonJS 模块
    const tempModule: { exports: { default?: object } } = { exports: {} }
    const fn = new Function('module', 'exports', result.code)
    fn(tempModule, tempModule.exports)

    return tempModule.exports.default ?? {}
  }
}
