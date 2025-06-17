import { CONFIG_FILE_NAME } from '../src/constants'
import * as cli from '../src/cli'
import mock from 'mock-fs'
import iconv from 'iconv-lite'
import path from 'path'
import { VUE_EXAMPLES } from './constants'
import { FileInterceptor, assertI18nReplacement } from './utils'

const lang = 'zh-cn'

const defaultConfig = `module.exports = {
  sourceLanguage: '${lang}',
  localesPaths: ['example/locales'],
  namespace: false,
  pathMatcher: '{locale}.{ext}',
}`

const examples = VUE_EXAMPLES.filter((example) => {
  return example.language === lang
})

// 解决iconv-lite在Jest环境下的问题
beforeAll(() => {
  iconv.encodingExists('utf8')
})

describe('Vue中文用例测试', () => {
  let idx = 0
  const fileInterceptor = new FileInterceptor()

  beforeEach(() => {
    // 设置文件拦截器
    fileInterceptor.setupFileInterceptor()

    const example = examples[idx]
    // 使用mock-fs模拟文件系统
    mock({
      [CONFIG_FILE_NAME]: defaultConfig,
      [`example/locales/${lang}.json`]: JSON.stringify({}),
      [`example-${idx}.vue`]: example.content,
      node_modules: mock.load(path.resolve(__dirname, '../node_modules')),
    })
  })

  afterEach(() => {
    idx++
    // 清理模拟的文件系统
    mock.restore()
    // 清理文件拦截器
    fileInterceptor.cleanupFileInterceptor() // 恢复原始配置缓存
  })

  examples.map((example) => {
    it(example.describe, async () => {
      const filepath = `example-${idx}.vue`
      const localeFilePath = `example/locales/${lang}.json`
      await cli.run(['node', 'auto-i18n', 'replace', filepath])
      const localeObj = JSON.parse(
        fileInterceptor.getCapturedFileContents(localeFilePath)
      )
      const replaced = fileInterceptor.getCapturedFileContents(filepath)
      assertI18nReplacement(example, localeObj, replaced)
    })
  })
})
