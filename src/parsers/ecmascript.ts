import { Parser } from './base'
import path from 'path'
import fs from 'fs'
import os from 'os'

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
    const raw = fs.readFileSync(filepath, 'utf-8')
    const tmpPath = path.join(os.tmpdir(), `./temp_${+new Date()}.js`)
    // 由于运行时不允许es6语法，只能替换一下再重新读取
    fs.writeFileSync(
      tmpPath,
      raw.replace('export default', 'exports.default ='),
      { flag: 'w' }
    )
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const obj = require(tmpPath).default
    // 删除文件
    fs.unlinkSync(tmpPath)
    return obj
  }
}
