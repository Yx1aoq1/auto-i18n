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

export const getReactConfig = (lang: string) => {
  return {
    // 语言配置
    sourceLanguage: lang,
    localesPaths: ['example/locales'],
    namespace: false,
    pathMatcher: '{locale}.{ext}',
    expressionTmp: '{{expression}}',
    i18nFuncTemp: 'i18n.t({key})',
  }
}

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
]
