import { parse } from '@vue/compiler-sfc'
import { cloneDeep } from 'lodash'
import { TransformHTML } from './TransformHTML'
import { TransformScript } from './TransformScript'
import { MatchToken } from './utils'
import compile from '@/vendor/sfcDescriptorStringify'
import { VueExtType } from '@/types'

export function TransformVue(
  code: string,
  replace: (token: MatchToken, origin: string, ext?: VueExtType) => string
) {
  const originSfcDescriptor = parse(code).descriptor
  const sfcDescriptor = cloneDeep(originSfcDescriptor)

  const tokens: MatchToken[] = []

  if (sfcDescriptor.template) {
    const transform = TransformHTML(
      sfcDescriptor.template.content,
      replace,
      'vueTemplate'
    )
    tokens.push(...transform!.tokens)
    sfcDescriptor.template.content = transform!.result
  }

  if (sfcDescriptor.script) {
    const lang = sfcDescriptor.script.attrs.lang
    const type = typeof lang === 'string' ? lang : 'js'
    const transform = TransformScript(
      sfcDescriptor.script.content,
      type,
      replace,
      'vueScript'
    )
    tokens.push(...transform!.tokens)
    sfcDescriptor.script.content = transform!.result
  }

  if (sfcDescriptor.scriptSetup) {
    const lang = sfcDescriptor.scriptSetup.attrs.lang
    const type = typeof lang === 'string' ? lang : 'js'
    const transform = TransformScript(
      sfcDescriptor.scriptSetup.content,
      type,
      replace,
      'vueSetup'
    )
    tokens.push(...transform!.tokens)
    sfcDescriptor.scriptSetup.content = transform!.result
  }

  const newCode = compile(sfcDescriptor)

  return {
    origin: code,
    tokens,
    result: newCode,
  }
}
