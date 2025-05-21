import { parse } from '@vue/compiler-sfc'
import { cloneDeep } from 'lodash'
import { HtmlPicker } from './HtmlPicker'
import { ScriptPicker } from './ScriptPicker'

export function VuePicker(code: string) {
  const originSfcDescriptor = parse(code).descriptor
  const sfcDescriptor = cloneDeep(originSfcDescriptor)
  const template = sfcDescriptor.template?.content
  // 兼容setup语法
  const script = sfcDescriptor.script ?? sfcDescriptor.scriptSetup
  const lang =
    typeof script?.attrs.lang === 'string' ? script?.attrs.lang : 'js'

  return [
    HtmlPicker(template),
    script ? ScriptPicker(script.content, lang) : [],
  ]
}
