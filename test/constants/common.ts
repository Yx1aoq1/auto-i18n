export interface Example {
  describe: string
  content: string
  matched: string[]
  result: string
  language: 'zh-cn' | 'en' | 'ja' | 'ko' | 'ru'
}
