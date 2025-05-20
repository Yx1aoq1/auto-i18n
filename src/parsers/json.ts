import { Parser } from './base'
import { I18nResource } from '@/types'

export class JsonParser extends Parser {
  id = 'json'

  constructor() {
    super(['json'], 'json')
  }

  async parse(text: string) {
    if (!text || !text.trim()) return {}
    return JSON.parse(text)
  }

  async dump(object: I18nResource) {
    const indent = 2
    return `${JSON.stringify(object, null, indent)}\n`
  }
}
