import { parse } from '@vue/compiler-sfc'
import { cloneDeep } from 'lodash'
import { TransformHTML } from './TransformHTML'
import { TransformScript } from './TransformScript'
import { MatchToken, replaceI18n } from './utils'
import compile from '@/vendor/sfcDescriptorStringify'

export function TransformVue(
  code: string,
  replace: (token: MatchToken, origin: string) => string
) {
  const originSfcDescriptor = parse(code).descriptor
  const sfcDescriptor = cloneDeep(originSfcDescriptor)

  const tokens: MatchToken[] = []

  if (sfcDescriptor.template) {
    const transform = TransformHTML(sfcDescriptor.template.content, replace)
    const t = transform?.tokens ?? []
    tokens.push(...t)
    sfcDescriptor.template.content = replaceI18n(
      sfcDescriptor.template.content,
      t,
      replace
    )
  }

  if (sfcDescriptor.script) {
    const lang = sfcDescriptor.script.attrs.lang
    const type = typeof lang === 'string' ? lang : 'js'
    const transform = TransformScript(
      sfcDescriptor.script.content,
      type,
      replace
    )
    const t = transform?.tokens ?? []
    tokens.push(...t)
    sfcDescriptor.script.content = replaceI18n(
      sfcDescriptor.script.content,
      t,
      replace
    )
  }

  if (sfcDescriptor.scriptSetup) {
    const lang = sfcDescriptor.scriptSetup.attrs.lang
    const type = typeof lang === 'string' ? lang : 'js'
    const transform = TransformScript(
      sfcDescriptor.scriptSetup.content,
      type,
      replace
    )
    const t = transform?.tokens ?? []
    tokens.push(...t)
    sfcDescriptor.scriptSetup.content = replaceI18n(
      sfcDescriptor.scriptSetup.content,
      t,
      replace
    )
  }

  const newCode = compile(sfcDescriptor)

  return {
    origin: code,
    tokens,
    result: newCode,
  }
}
