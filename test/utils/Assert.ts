import { Example } from '../constants'
import { template as _template } from 'lodash'

export const assertI18nReplacement = (
  example: Example,
  localeObj: Record<string, string>,
  replaced: string
) => {
  const keys: string[] = []
  example.matched.map((text) => {
    const translationKey = Object.keys(localeObj).find((key) => {
      return localeObj[key] === text
    })
    keys.push(translationKey as string)
  })
  expect(Object.values(localeObj)).toEqual(example.matched)
  const compiledTemplate = _template(example.result)
  const expectedPattern = compiledTemplate({ keys })
  expect(replaced).toBe(expectedPattern)
}
