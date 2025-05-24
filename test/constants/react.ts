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
  {
    describe: '测试英文匹配',
    content: compiledReactDivTemplate({ text: 'Test English' }),
    matched: ['Test English'],
    result: compiledReactDivTemplate({ text: `{t('<%= keys[0] %>')}` }),
    language: 'en',
  },
  {
    describe: '测试英文+变量',
    content: compiledReactDivTemplate({ text: 'Test English {{ value }}' }),
    matched: ['Test English {value}'],
    result: compiledReactDivTemplate({
      text: `{t('<%= keys[0] %>', { value })}`,
    }),
    language: 'en',
  },
  {
    describe: '带空格的英文',
    content: compiledReactDivTemplate({ text: ' Welcome ' }),
    matched: ['Welcome'],
    result: compiledReactDivTemplate({
      text: ` {t('<%= keys[0] %>')} `,
    }),
    language: 'en',
  },
  {
    describe: '函数内部英文',
    content: compiledReactDivTemplate({ text: '{ fun("Test English") }' }),
    matched: ['Test English'],
    result: compiledReactDivTemplate({
      text: `{ fun(t('<%= keys[0] %>')) }`,
    }),
    language: 'en',
  },
  {
    describe: '变量插在中间',
    content: compiledReactDivTemplate({
      text: 'Hello, { value } Goodbye',
    }),
    matched: ['Hello, {{value}} Goodbye'],
    result: compiledReactDivTemplate({
      text: `{t('<%= keys[0] %>', { value })}`,
    }),
    language: 'en',
  },
  {
    describe: '带换行的英文',
    content: compiledReactBreakDivTemplate({ text: 'Test English' }),
    matched: ['Test English'],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>')}`,
    }),
    language: 'en',
  },
  {
    describe: '变量换行后的英文',
    content: compiledReactBreakDivTemplate({
      text: '{{ value }}\nTest English',
    }),
    matched: ['Test English'],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>')}`,
    }),
    language: 'en',
  },
  {
    describe: '多行英文',
    content: compiledReactBreakDivTemplate({
      text: '1.First line\n2.Second line\n3.Third line',
    }),
    matched: ['1.First line', '2.Second line', '3.Third line'],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>')}\n{t('<%= keys[1] %>')}\n{t('<%= keys[2] %>')}`,
    }),
    language: 'en',
  },
  {
    describe: '复杂换行情况',
    content: compiledReactBreakDivTemplate({
      text: 'My name is {{ v1 }} heihei\nYou are welcome\n{{ v2 }} test third line',
    }),
    matched: [
      'My name is {v1} heihei',
      'You are welcome',
      '{v2} test third line',
    ],
    result: compiledReactBreakDivTemplate({
      text: `{t('<%= keys[0] %>', { v1 })}\n{t('<%= keys[1] %>')}\n{t('<%= keys[2] %>', { v2 })}`,
    }),
    language: 'en',
  },
  {
    describe: '属性纯英文',
    content: compiledReactBreakDivTemplate({
      text: '<input placeholder="Please Enter Your Name" />',
    }),
    matched: ['Please Enter Your Name'],
    result: compiledReactBreakDivTemplate({
      text: `<input placeholder={t('<%= keys[0] %>')} />`,
    }),
    language: 'en',
  },
  {
    describe: '属性为ES6模板字符串',
    content: compiledReactBreakDivTemplate({
      text: '<input placeholder={`Please Enter ${value}`} />',
    }),
    matched: ['Please Enter {{value}}'],
    result: compiledReactBreakDivTemplate({
      text: `<input placeholder={t('<%= keys[0] %>', { value })} />`,
    }),
    language: 'en',
  },
  {
    describe: '属性值为对象',
    content: compiledReactComponentTemplate({
      text: "rule={{ required: true, message: 'Can not be empty' }}",
    }),
    matched: ['Can not be empty'],
    result: compiledReactComponentTemplate({
      text: `rule={{ required: true, message: t('<%= keys[0] %>') }}`,
    }),
    language: 'en',
  },
  {
    describe: '属性值为字符串数组',
    content: compiledReactComponentTemplate({
      text: `array={['Element 1', 'Element 2']}`,
    }),
    matched: ['Element 1', 'Element 2'],
    result: compiledReactComponentTemplate({
      text: `array={[t('<%= keys[0] %>'), t('<%= keys[1] %>')]}`,
    }),
    language: 'en',
  },
  {
    describe: '多个中文属性',
    content: compiledReactComponentTemplate({
      text: `a="English a" b="English b"`,
    }),
    matched: ['English a', 'English b'],
    result: compiledReactComponentTemplate({
      text: `a={t('<%= keys[0] %>')} b={t('<%= keys[1] %>')}`,
    }),
    language: 'en',
  },
  {
    describe: '重复中文属性',
    content: compiledReactComponentTemplate({
      text: `a="English a" b="English a"`,
    }),
    matched: ['English a'],
    result: compiledReactComponentTemplate({
      text: `a={t('<%= keys[0] %>')} b={t('<%= keys[0] %>')}`,
    }),
    language: 'en',
  },
  {
    describe: '属性是一个表达式计算',
    content: compiledReactComponentTemplate({
      text: `text={'Hello' + name}`,
    }),
    matched: ['Hello'],
    result: compiledReactComponentTemplate({
      text: `text={t('<%= keys[0] %>') + name}`,
    }),
    language: 'en',
  },
  {
    describe: 'React Script 英文变量',
    content: compiledReactScriptDataTemplate({
      text: `"Test English"`,
    }),
    matched: ['Test English'],
    result: compiledReactScriptDataTemplate({
      text: `t('<%= keys[0] %>')`,
    }),
    language: 'en',
  },
  {
    describe: 'React Script 对象英文',
    content: compiledReactScriptDataTemplate({
      text: `{ text: "Test English" }`,
    }),
    matched: ['Test English'],
    result: compiledReactScriptDataTemplate({
      text: `{ text: t('<%= keys[0] %>') }`,
    }),
    language: 'en',
  },
  {
    describe: 'React Script 数组英文',
    content: compiledReactScriptDataTemplate({
      text: `['Test English 1', 'Test English 2']`,
    }),
    matched: ['Test English 1', 'Test English 2'],
    result: compiledReactScriptDataTemplate({
      text: `[t('<%= keys[0] %>'), t('<%= keys[1] %>')]`,
    }),
    language: 'en',
  },
  {
    describe: 'React Script ES6模板',
    content: compiledReactScriptDataTemplate({
      text: '`Hello ${value} abc`',
    }),
    matched: ['Hello {{value}} abc'],
    result: compiledReactScriptDataTemplate({
      text: `t('<%= keys[0] %>', { value })`,
    }),
    language: 'en',
  },
  {
    describe: 'React Script 函数参数',
    content: compiledReactScriptDataTemplate({
      text: `fun('English', 'Chinese')`,
    }),
    matched: ['English', 'Chinese'],
    result: compiledReactScriptDataTemplate({
      text: `fun(t('<%= keys[0] %>'), t('<%= keys[1] %>'))`,
    }),
    language: 'en',
  },
  {
    describe: 'React Script 复杂的ES6模板',
    content: compiledReactScriptDataTemplate({
      text: '`Hello ${flag ? "English" : "Chinese"}`',
    }),
    matched: ['English', 'Chinese', 'Hello {{value0}}'],
    result: compiledReactScriptDataTemplate({
      text: `t('<%= keys[2] %>', { value0: flag ? t('<%= keys[0] %>') : t('<%= keys[1] %>') })`,
    }),
    language: 'en',
  },
]
