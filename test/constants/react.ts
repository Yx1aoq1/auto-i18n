import { template as _template } from 'lodash' // 引入lodash的template方法
import { Example } from './common'

const REACT_DIV_TEMPLATE = `const Example: React.FC = () => {
  return <div>{{text}}</div>
}
`

const REACT_BREAK_DIV_TEMPLATE = `const Example: React.FC = () => {
  return (
    <div>
      {{text}}
    </div>
  )
}
`

const REACT_COMPONENT_TEMPLATE = `const Example: React.FC = () => {
  return (
    <DemoComponent
      {{text}}
    ></DemoComponent>
  )
}
`

const REACT_SCRIPT_DATA_TEMPLATE = `const Example: React.FC = () => {
  const text = {{text}}
  return <App />
}
`

const compiledReactDivTemplate = _template(REACT_DIV_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

const compiledReactBreakDivTemplate = _template(REACT_BREAK_DIV_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

const compiledReactComponentTemplate = _template(REACT_COMPONENT_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

const compiledReactScriptDataTemplate = _template(REACT_SCRIPT_DATA_TEMPLATE, {
  interpolate: /{{([\s\S]+?)}}/g,
})

export const REACT_EXAMPLES: Example[] = [
  {
    describe: '纯文字替换',
    content: compiledReactDivTemplate({ text: '纯文字替换' }),
    matched: ['纯文字替换'],
    result: compiledReactDivTemplate({ text: `{t('<%= keys[0] %>')}` }),
    language: 'zh-cn',
  },
  {
    describe: '中文+变量显示：{value}',
    content: compiledReactDivTemplate({ text: '中文+变量显示：{value}' }),
    matched: ['中文+变量显示：{{value}}'],
    result: compiledReactDivTemplate({
      text: `{t('<%= keys[0] %>', { value })}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '带空格的文字',
    content: compiledReactDivTemplate({ text: ' 带空格的文字 ' }),
    matched: ['带空格的文字'],
    result: compiledReactDivTemplate({
      text: ` {t('<%= keys[0] %>')} `,
    }),
    language: 'zh-cn',
  },
  {
    describe: '函数内部中文',
    content: compiledReactDivTemplate({ text: '{ fun("函数内部中文") }' }),
    matched: ['函数内部中文'],
    result: compiledReactDivTemplate({
      text: `{ fun(t('<%= keys[0] %>')) }`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '变量插在中间',
    content: compiledReactDivTemplate({
      text: '变量插在中间 { value } 变量的后面',
    }),
    matched: ['变量插在中间 {{value}} 变量的后面'],
    result: compiledReactDivTemplate({
      text: `{t('<%= keys[0] %>', { value })}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '带换行的文字',
    content: compiledReactBreakDivTemplate({ text: '带换行的文字' }),
    matched: ['带换行的文字'],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>')}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '变量换行后的中文',
    content: compiledReactBreakDivTemplate({
      text: '{value}\n变量换行后的中文',
    }),
    matched: ['变量换行后的中文'],
    result: compiledReactBreakDivTemplate({
      text: `{value}\n{t('<%= keys[0] %>')}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '多行文字',
    content: compiledReactBreakDivTemplate({
      text: '1.第一行\n2.第二行\n3.第三行',
    }),
    matched: ['1.第一行', '2.第二行', '3.第三行'],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>')}\n{t('<%= keys[1] %>')}\n{t('<%= keys[2] %>')}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '复杂换行情况',
    content: compiledReactBreakDivTemplate({
      text: '变量插在中间{v1}变量的后面\n有一行中文\n{v2}第二段文字',
    }),
    matched: ['变量插在中间{{v1}}变量的后面', '有一行中文', '{{v2}}第二段文字'],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>', { v1 })}\n{t('<%= keys[1] %>')}\n{t('<%= keys[2] %>', { v2 })}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性纯中文',
    content: compiledReactBreakDivTemplate({
      text: '<input placeholder="属性纯中文" />',
    }),
    matched: ['属性纯中文'],
    result: compiledReactBreakDivTemplate({
      text: `<input placeholder={t('<%= keys[0] %>')} />`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性为ES6模板字符串',
    content: compiledReactBreakDivTemplate({
      text: '<input placeholder={`ES6模板字符串${value}`} />',
    }),
    matched: ['ES6模板字符串{{value}}'],
    result: compiledReactBreakDivTemplate({
      text: `<input placeholder={t('<%= keys[0] %>', { value })} />`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性值为对象',
    content: compiledReactComponentTemplate({
      text: "rule={{ required: true, message: '不能为空' }}",
    }),
    matched: ['不能为空'],
    result: compiledReactComponentTemplate({
      text: `rule={{ required: true, message: t('<%= keys[0] %>') }}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性值为字符串数组',
    content: compiledReactComponentTemplate({
      text: `array={['元素1', '元素2']}`,
    }),
    matched: ['元素1', '元素2'],
    result: compiledReactComponentTemplate({
      text: `array={[t('<%= keys[0] %>'), t('<%= keys[1] %>')]}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '多个中文属性',
    content: compiledReactComponentTemplate({
      text: `a="中文a" b="中文b"`,
    }),
    matched: ['中文a', '中文b'],
    result: compiledReactComponentTemplate({
      text: `a={t('<%= keys[0] %>')} b={t('<%= keys[1] %>')}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '重复中文属性',
    content: compiledReactComponentTemplate({
      text: `a="中文" b="中文"`,
    }),
    matched: ['中文'],
    result: compiledReactComponentTemplate({
      text: `a={t('<%= keys[0] %>')} b={t('<%= keys[0] %>')}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: '属性是一个表达式计算',
    content: compiledReactComponentTemplate({
      text: `text={'你好' + name}`,
    }),
    matched: ['你好'],
    result: compiledReactComponentTemplate({
      text: `text={t('<%= keys[0] %>') + name}`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'React Script 中文变量',
    content: compiledReactScriptDataTemplate({
      text: `"测试定义变量中文"`,
    }),
    matched: ['测试定义变量中文'],
    result: compiledReactScriptDataTemplate({
      text: `t('<%= keys[0] %>')`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'React Script 对象中文',
    content: compiledReactScriptDataTemplate({
      text: `{ text: "测试定义变量中文" }`,
    }),
    matched: ['测试定义变量中文'],
    result: compiledReactScriptDataTemplate({
      text: `{ text: t('<%= keys[0] %>') }`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'React Script 数组中文',
    content: compiledReactScriptDataTemplate({
      text: `['测试定义变量中文1', '测试定义变量中文2']`,
    }),
    matched: ['测试定义变量中文1', '测试定义变量中文2'],
    result: compiledReactScriptDataTemplate({
      text: `[t('<%= keys[0] %>'), t('<%= keys[1] %>')]`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'React Script ES6模板',
    content: compiledReactScriptDataTemplate({
      text: '`ES6模板${value}ES6模板`',
    }),
    matched: ['ES6模板{{value}}ES6模板'],
    result: compiledReactScriptDataTemplate({
      text: `t('<%= keys[0] %>', { value })`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'React Script 函数参数',
    content: compiledReactScriptDataTemplate({
      text: `fun('中文', '英文')`,
    }),
    matched: ['中文', '英文'],
    result: compiledReactScriptDataTemplate({
      text: `fun(t('<%= keys[0] %>'), t('<%= keys[1] %>'))`,
    }),
    language: 'zh-cn',
  },
  {
    describe: 'React Script 复杂的ES6模板',
    content: compiledReactScriptDataTemplate({
      text: '`ES6模板${flag ? "中文" : "英文"}ES6模板`',
    }),
    matched: ['中文', '英文', 'ES6模板{{value0}}ES6模板'],
    result: compiledReactScriptDataTemplate({
      text: `t('<%= keys[2] %>', { value0: flag ? t('<%= keys[0] %>') : t('<%= keys[1] %>') })`,
    }),
    language: 'zh-cn',
  },
]
