import * as cli from '../src/cli'

// mock Config
jest.mock('../src/plugins/Config', () => ({
  Config: {
    getConfig: jest.fn().mockReturnValue({
      sourceLanguage: 'zh-cn',
      localesPaths: ['example/locales'],
      namespace: false,
      pathMatcher: '{locale}.{ext}',
    }),
  },
}))

describe('cli run', () => {
  it('should call pick command', async () => {
    const filepath = 'test-file.ts'
    const namespace = 'test-namespace'

    await cli.run(['node', 'auto-i18n', 'pick', filepath, namespace])
  })
})
