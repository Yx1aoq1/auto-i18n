import { ensureDirectoryExistence } from '@/utils'
import fs from 'fs'
import { I18nResource } from '@/types'

export abstract class Parser {
  protected languageIds: string | string[]
  protected supportedExts: string | string[]
  protected supportedExtsRegex: RegExp

  constructor(
    languageIds: string | string[],
    supportedExts: string | string[]
  ) {
    this.languageIds = languageIds
    this.supportedExts = supportedExts
    this.supportedExtsRegex = new RegExp(`.?(${this.supportedExts})$`)
  }

  supports(ext: string): boolean {
    return !!ext.toLowerCase().match(this.supportedExtsRegex)
  }

  async load(filepath: string): Promise<I18nResource> {
    const raw = fs.readFileSync(filepath, 'utf-8')
    if (!raw) return {}
    return await this.parse(raw)
  }

  async save(filepath: string, object: I18nResource): Promise<void> {
    const text = await this.dump(object)
    ensureDirectoryExistence(filepath)
    fs.writeFileSync(filepath, text)
  }

  abstract parse(text: string): Promise<I18nResource> | I18nResource

  abstract dump(object: I18nResource): Promise<string> | string
}
