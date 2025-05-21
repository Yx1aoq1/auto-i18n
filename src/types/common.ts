/**
 * 项目公共类型声明
 */
import { Command } from 'commander'

export type CommandModule = (program: Command) => void
