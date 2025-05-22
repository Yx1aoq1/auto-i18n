import { template as _template } from 'lodash' // 引入lodash的template方法

/**
 * 断言国际化替换结果
 * @param capturedFileContents 捕获的文件内容
 * @param expectedText 期望的翻译文本
 * @param filepath Vue文件路径
 * @param templateString 可选的模板字符串，默认为 "{{ $t('${translationKey}') }}"
 * @param validateContent 可选的内容验证函数，默认使用Vue编译器验证
 */
export const assertI18nReplacement = (
  capturedFileContents: Record<string, string>,
  filepath: string,
  expectedText: string,
  templateString: string
) => {
  // 找到中文语言文件的路径
  const zhCnFilePath = Object.keys(capturedFileContents).find((path) => {
    return path.endsWith('zh-cn.json')
  })
  // 断言中文文件存在
  expect(zhCnFilePath).toBeDefined()
  if (zhCnFilePath) {
    // 解析JSON内容
    const zhCnContent = JSON.parse(capturedFileContents[zhCnFilePath])
    // 检查是否有值为期望文本的翻译项
    const hasTargetText = Object.values(zhCnContent).some(
      (value) => value === expectedText
    )
    // 断言包含目标文本
    expect(hasTargetText).toBe(true)
    // 获取值为期望文本的翻译项的key
    const translationKey = Object.keys(zhCnContent).find(
      (key) => zhCnContent[key] === expectedText
    )
    // 断言key存在
    expect(translationKey).toBeDefined()
    // 获取文件内容
    const content = capturedFileContents[filepath]
    // 使用模板生成预期文本
    const compiledTemplate = _template(templateString)
    const expectedPattern = compiledTemplate({ translationKey })
    // 断言中包含正确的模板内容
    expect(content).toContain(expectedPattern)
  }
}
