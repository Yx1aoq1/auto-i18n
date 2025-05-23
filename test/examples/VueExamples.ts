import { template as _template } from 'lodash' // 引入lodash的template方法

const VUE_DIV_TEMPLATE = `
<template>
  <div>{{text}}</div>
</template>
`

export const VUE_ZH_CONFIG = `
module.exports = {
  sourceLanguage: 'zh-cn',
  localesPaths: ['example/locales'],
  namespace: true,
  pathMatcher: '{locale}.{ext}'
}
`

export interface Example {
  describe: string
  content: string
  matched: string[]
  result: string
}

const compiledVueDivTemplate = _template(VUE_DIV_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

export const VUE_ZH_EXAMPLES: Record<string, Example> = {
  'example-1.vue': {
    describe: '纯文字替换',
    content: compiledVueDivTemplate({ text: '纯文字替换' }),
    matched: ['纯文字替换'],
    result: `<div>{{ $t('{{translationKey}}') }}</div>`,
  },
  'example-2.vue': {
    describe: '中文+变量显示：{value}',
    content: compiledVueDivTemplate({ text: '中文+变量显示：{value}' }),
    matched: ['中文+变量显示：{value}'],
    result: `<div>{{ $t('{{translationKey}}', { value }) }}</div>`,
  },
}
