import { File } from '@/plugins'
export abstract class Parser {
  abstract readonly id: string

  private supportedExtsRegex: RegExp

  readonly readonly: boolean = false

  constructor(
    public readonly languageIds: string[],
    public readonly supportedExts: string
  ) {
    this.supportedExtsRegex = new RegExp(`.?(${this.supportedExts})$`)
  }

  supports(ext: string) {
    return !!ext.toLowerCase().match(this.supportedExtsRegex)
  }

  async load(filepath: string): Promise<object> {
    const raw = await File.read(filepath)
    if (!raw) return {}
    return await this.parse(raw)
  }

  async save(filepath: string, object: object) {
    const text = await this.dump(object)
    await File.write(filepath, text)
  }

  abstract parse(text: string): Promise<object>

  abstract dump(object: object): Promise<string>
}
