import * as cli from '../src/cli'
import mock from 'mock-fs'
import iconv from 'iconv-lite'
import path from 'path'
import { assertI18nReplacement } from './utils/assertions'
import {
  setupFileInterceptor,
  cleanupFileInterceptor,
  capturedFileContents,
} from './utils/file-interceptor'

// 解决iconv-lite在Jest环境下的问题
beforeAll(() => {
  iconv.encodingExists('utf8')
})

describe('cli run', () => {
  beforeEach(() => {
    // 设置文件拦截器
    setupFileInterceptor()

    // 使用mock-fs模拟文件系统
    mock({
      'i18n.config.js': `
module.exports = {
  sourceLanguage: 'zh-cn',
  localesPaths: ['example/locales'],
  namespace: true,
  pathMatcher: '{locale}.{ext}'
}
      `,
      'example/locales/zh-cn.json': JSON.stringify({}),
      'example/vue/': mock.load(path.resolve(__dirname, '../example/vue/')),
      node_modules: mock.load(path.resolve(__dirname, '../node_modules')),
    })
  })

  afterEach(() => {
    // 清理模拟的文件系统
    mock.restore()
    // 清理文件拦截器
    cleanupFileInterceptor()
  })

  it('纯文字替换', async () => {
    const filepath = 'example/vue/Example-1.vue'

    await cli.run(['node', 'auto-i18n', 'replace', filepath])

    console.log('capturedFileContents:', capturedFileContents)

    assertI18nReplacement(
      capturedFileContents,
      filepath,
      '纯文字替换',
      "{{ $t('${translationKey}') }}"
    )
  })

  it('中文+变量显示：{{ value }}', async () => {
    const filepath = 'example/vue/Example-2.vue'

    await cli.run(['node', 'auto-i18n', 'replace', filepath])

    console.log('capturedFileContents:', capturedFileContents)

    assertI18nReplacement(
      capturedFileContents,
      filepath,
      '中文+变量显示：{value}',
      "<div>{{ $t('${translationKey}', { value }) }}</div>"
    )
  })

  it('变量后的中文', async () => {
    const filepath = 'example/vue/Example-3.vue'

    await cli.run(['node', 'auto-i18n', 'replace', filepath])

    console.log('capturedFileContents:', capturedFileContents)

    assertI18nReplacement(
      capturedFileContents,
      filepath,
      '变量后的中文',
      "{{ $t('${translationKey}') }}"
    )
  })

  it('属性纯中文', async () => {
    const filepath = 'example/vue/Example-4.vue'

    await cli.run(['node', 'auto-i18n', 'replace', filepath])

    console.log('capturedFileContents:', capturedFileContents)

    assertI18nReplacement(
      capturedFileContents,
      filepath,
      '属性纯中文',
      '<input :placeholder="$t(\'${translationKey}\')" />'
    )
  })
})
