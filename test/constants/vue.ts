import { template as _template } from 'lodash' // 引入lodash的template方法
import { Example } from './common'

const VUE_DIV_TEMPLATE = `<template>
  <div>{text}</div>
</template>
`

const VUE_BREAK_DIV_TEMPLATE = `<template>
  <div>
    {text}
  </div>
</template>
`

const VUE_COMPONENT_TEMPLATE = `<template>
  <DemoComponent
    {text}
  ></DemoComponent>
</template>
`

const VUE_SCRIPT_DATA_TEMPLATE = `<script>
export default {
  data() {
    return {
      value: {{text}}
    }
  },
}
</script>
`

const VUE_SET_UP_DATA_TEMPLATE = `<script lang="ts" setup>
const text = {{text}}
</script>
`

const compiledVueDivTemplate = _template(VUE_DIV_TEMPLATE, {
  interpolate: /{([\s\S]+?)}/g,
})

const compiledVueBreakDivTemplate = _template(VUE_BREAK_DIV_TEMPLATE, {
  interpolate: /{([\s\S]+?)}/g,
})

const compiledVueComponentTemplate = _template(VUE_COMPONENT_TEMPLATE, {
  interpolate: /{([\s\S]+?)}/g,
})

const compiledVueScriptDataTemplate = _template(VUE_SCRIPT_DATA_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

const compiledVueSetupDataTemplate = _template(VUE_SET_UP_DATA_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

export const VUE_EXAMPLES: Example[] = [
  {
    describe: '纯文字替换',
    content: compiledVueDivTemplate({ text: '纯文字替换' }),
    matched: ['纯文字替换'],
    result: compiledVueDivTemplate({ text: `{{ $t('<%= keys[0] %>') }}` }),
    language: 'zh-cn',
  },
  {
    describe: '中文+变量显示：{{value}}',
    content: compiledVueDivTemplate({ text: '中文+变量显示：{{value}}' }),
    matched: ['中文+变量显示：{value}'],
    result: compiledVueDivTemplate({
      text: `{{ $t('<%= keys[0] %>', { value }) }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '带空格的文字',
    content: compiledVueDivTemplate({ text: ' 带空格的文字 ' }),
    matched: ['带空格的文字'],
    result: compiledVueDivTemplate({
      text: ` {{ $t('<%= keys[0] %>') }} `,
    }),
    language: 'zh-cn',
  },
  {
    describe: '函数内部中文',
    content: compiledVueDivTemplate({
      text: "{{ fun('函数内部中文') }}",
    }),
    matched: ['函数内部中文'],
    result: compiledVueDivTemplate({
      text: `{{ fun($t('<%= keys[0] %>')) }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '变量插在中间',
    content: compiledVueDivTemplate({
      text: '变量插在中间 {{ value }} 变量的后面',
    }),
    matched: ['变量插在中间 {value} 变量的后面'],
    result: compiledVueDivTemplate({
      text: `{{ $t('<%= keys[0] %>', { value }) }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '带换行的文字',
    content: compiledVueBreakDivTemplate({ text: '带换行的文字' }),
    matched: ['带换行的文字'],
    result: compiledVueBreakDivTemplate({
      text: `{{ $t('<%= keys[0] %>') }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '变量换行后的中文',
    content: compiledVueBreakDivTemplate({
      text: '{{ value }}\n变量换行后的中文',
    }),
    matched: ['变量换行后的中文'],
    result: compiledVueBreakDivTemplate({
      text: `{{ value }}\n{{ $t('<%= keys[0] %>') }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '多行文字',
    content: compiledVueBreakDivTemplate({
      text: '1.第一行\n2.第二行\n3.第三行',
    }),
    matched: ['1.第一行', '2.第二行', '3.第三行'],
    result: compiledVueBreakDivTemplate({
      text: `{{ $t('<%= keys[0] %>') }}\n{{ $t('<%= keys[1] %>') }}\n{{ $t('<%= keys[2] %>') }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '复杂换行情况',
    content: compiledVueBreakDivTemplate({
      text: '变量插在中间{{ v1 }}变量的后面\n有一行中文\n{{ v2 }}第二段文字',
    }),
    matched: ['变量插在中间{v1}变量的后面', '有一行中文', '{v2}第二段文字'],
    result: compiledVueBreakDivTemplate({
      text: `{{ $t('<%= keys[0] %>', { v1 }) }}\n{{ $t('<%= keys[0] %>') }}\n{{ $t('<%= keys[0] %>', { v2 }) }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性纯中文',
    content: compiledVueBreakDivTemplate({
      text: '<input placeholder="属性纯中文" />',
    }),
    matched: ['属性纯中文'],
    result: compiledVueBreakDivTemplate({
      text: `<input :placeholder="$t('<%= keys[0] %>')" />`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性为ES6模板字符串',
    content: compiledVueBreakDivTemplate({
      text: '<input :placeholder="`ES6模板字符串${value}`" />',
    }),
    matched: ['ES6模板字符串{value}'],
    result: compiledVueBreakDivTemplate({
      text: `<input :placeholder="$t('<%= keys[0] %>', { value })" />`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性值为对象',
    content: compiledVueComponentTemplate({
      text: ':rule="{ required: true, message: \'不能为空\' }"',
    }),
    matched: ['不能为空'],
    result: compiledVueComponentTemplate({
      text: `:rule="{ required: true, message: $t('<%= keys[0] %>') }"`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性值为字符串数组',
    content: compiledVueComponentTemplate({
      text: `:array="['元素1', '元素2']"`,
    }),
    matched: ['元素1', '元素2'],
    result: compiledVueComponentTemplate({
      text: `:array="[$t('<%= keys[0] %>'), $t('<%= keys[1] %>')]"`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '多个中文属性',
    content: compiledVueComponentTemplate({
      text: `a="中文a" b="中文b"`,
    }),
    matched: ['中文a', '中文b'],
    result: compiledVueComponentTemplate({
      text: `:a="$t('<%= keys[0] %>')" :b="$t('<%= keys[1] %>')"`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '重复中文属性',
    content: compiledVueComponentTemplate({
      text: `a="中文" b="中文"`,
    }),
    matched: ['中文'],
    result: compiledVueComponentTemplate({
      text: `:a="$t('<%= keys[0] %>')" :b="$t('<%= keys[0] %>')"`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性是一个表达式计算',
    content: compiledVueComponentTemplate({
      text: `:text="'你好' + name"`,
    }),
    matched: ['你好'],
    result: compiledVueComponentTemplate({
      text: `:text="$t('<%= keys[0] %>') + name"`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Script 中文变量',
    content: compiledVueScriptDataTemplate({
      text: `"测试定义变量中文"`,
    }),
    matched: ['测试定义变量中文'],
    result: compiledVueScriptDataTemplate({
      text: `this.$t('<%= keys[0] %>')`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Script 对象中文',
    content: compiledVueScriptDataTemplate({
      text: `{ text: "测试定义变量中文" }`,
    }),
    matched: ['测试定义变量中文'],
    result: compiledVueScriptDataTemplate({
      text: `{ text: this.$t('<%= keys[0] %>') }`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Script 数组中文',
    content: compiledVueScriptDataTemplate({
      text: `['测试定义变量中文1', '测试定义变量中文2']`,
    }),
    matched: ['测试定义变量中文1', '测试定义变量中文2'],
    result: compiledVueScriptDataTemplate({
      text: `[this.$t('<%= keys[0] %>'), this.$t('<%= keys[1] %>')]`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Script ES6模板',
    content: compiledVueScriptDataTemplate({
      text: '`ES6模板${this.value}ES6模板`',
    }),
    matched: ['ES6模板{value0}ES6模板'],
    result: compiledVueScriptDataTemplate({
      text: `this.$t('<%= keys[0] %>', { value0: this.value })`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Script 函数参数',
    content: compiledVueScriptDataTemplate({
      text: `fun('中文', '英文')`,
    }),
    matched: ['中文', '英文'],
    result: compiledVueScriptDataTemplate({
      text: `fun(this.$t('<%= keys[0] %>'), this.$t('<%= keys[1] %>'))`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Script 复杂的ES6模板',
    content: compiledVueScriptDataTemplate({
      text: '`ES6模板${this.flag ? "中文" : "英文"}ES6模板`',
    }),
    matched: ['ES6模板{value0}ES6模板', '中文', '英文'],
    result: compiledVueScriptDataTemplate({
      text: `this.$t('<%= keys[0] %>', { value0: this.flag ? this.$t('<%= keys[1] %>') : this.$t('<%= keys[2] %>') })`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Setup 中文变量',
    content: compiledVueSetupDataTemplate({
      text: `"测试定义变量中文"`,
    }),
    matched: ['测试定义变量中文'],
    result: compiledVueSetupDataTemplate({
      text: `i18n.$t('<%= keys[0] %>')`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Setup 对象中文',
    content: compiledVueSetupDataTemplate({
      text: `{ text: "测试定义变量中文" }`,
    }),
    matched: ['测试定义变量中文'],
    result: compiledVueSetupDataTemplate({
      text: `{ text: i18n.$t('<%= keys[0] %>') }`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Setup 数组中文',
    content: compiledVueSetupDataTemplate({
      text: `['测试定义变量中文1', '测试定义变量中文2']`,
    }),
    matched: ['测试定义变量中文1', '测试定义变量中文2'],
    result: compiledVueSetupDataTemplate({
      text: `[i18n.$t('<%= keys[0] %>'), i18n.$t('<%= keys[1] %>')]`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Setup ES6模板',
    content: compiledVueSetupDataTemplate({
      text: '`ES6模板${value}ES6模板`',
    }),
    matched: ['ES6模板{value}ES6模板'],
    result: compiledVueSetupDataTemplate({
      text: `i18n.$t('<%= keys[0] %>', { value })`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Setup 函数参数',
    content: compiledVueSetupDataTemplate({
      text: `fun('中文', '英文')`,
    }),
    matched: ['中文', '英文'],
    result: compiledVueSetupDataTemplate({
      text: `fun(i18n.$t('<%= keys[0] %>'), i18n.$t('<%= keys[1] %>'))`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Vue Setup 复杂的ES6模板',
    content: compiledVueSetupDataTemplate({
      text: '`ES6模板${flag ? "中文" : "英文"}ES6模板`',
    }),
    matched: ['ES6模板{value0}ES6模板', '中文', '英文'],
    result: compiledVueSetupDataTemplate({
      text: `i18n.$t('<%= keys[0] %>', { value0: flag ? i18n.$t('<%= keys[1] %>') : i18n.$t('<%= keys[2] %>') })`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'Test English',
    content: compiledVueDivTemplate({
      text: `Test English`,
    }),
    matched: ['Test English'],
    result: compiledVueDivTemplate({
      text: `{{ $t('<%= keys[0] %>') }}`,
    }),
    language: 'en',
  },
]
