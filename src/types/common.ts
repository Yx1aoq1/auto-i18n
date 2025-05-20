/**
 * 项目公共类型声明
 */
import { Command } from 'commander'

export type CommandModule = (program: Command) => void

/**
 * 表示国际化资源对象的类型，支持多层嵌套，最终值为字符串
 * 例如：
 * { a: 'xxx' } 或 { a: { b: 'xxx' } }
 */
export type I18nResource = {
  [key: string]: I18nResource | string
}
