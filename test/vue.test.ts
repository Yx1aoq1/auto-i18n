import * as cli from '../src/cli'
import mock from 'mock-fs'
import iconv from 'iconv-lite'
import path from 'path'
import { VUE_ZH_CONFIG, VUE_ZH_EXAMPLES } from './examples'
import {
  setupFileInterceptor,
  cleanupFileInterceptor,
  capturedFileContents,
} from './utils'

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
      'i18n.config.js': VUE_ZH_CONFIG,
      'example/locales/zh-cn.json': JSON.stringify({}),
      ...Object.keys(VUE_ZH_EXAMPLES).reduce(
        (res, key) => {
          res[key] = VUE_ZH_EXAMPLES[key].content
          return res
        },
        {} as Record<string, string>
      ),
      node_modules: mock.load(path.resolve(__dirname, '../node_modules')),
    })
  })

  afterEach(() => {
    // 清理模拟的文件系统
    mock.restore()
    // 清理文件拦截器
    cleanupFileInterceptor()
  })

  Object.keys(VUE_ZH_EXAMPLES).map((key) => {
    const example = VUE_ZH_EXAMPLES[key]

    it(example.describe, async () => {
      const filepath = key
      await cli.run(['node', 'auto-i18n', 'replace', filepath])
      console.log('capturedFileContents:', capturedFileContents)
    })
  })
})
