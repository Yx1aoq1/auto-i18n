import chalk from 'chalk'
import dayjs from 'dayjs'
// logger
const info = console.info

export interface Logger {
  log: typeof console.log
  success: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
  debug: (...args: any[]) => void
  logWithTime: (...args: any[]) => void
}

export const logger: Logger = {
  log: console.log,
  success: function (...args: any[]) {
    info(chalk.green(' √ ' + args.join(' ')))
  },
  warn: function (...args: any[]) {
    info(chalk.yellow(' ∆ ' + args.join(' ')))
  },
  error: function (...args: any[]) {
    info(chalk.bold.red(' X '), chalk.bold.red(args.join(' ')))
  },
  info: function (...args: any[]) {
    console.log(chalk.cyan('[auto-i18n] '), args.join(' '))
  },
  debug: function (...args: any[]) {
    console.log(chalk.gray('[debug] '), args.join(' '))
  },
  logWithTime: function (...args: any[]) {
    info(
      chalk.cyan('[auto-i18n] ') +
        ' [' +
        dayjs().format('YY.MM.DD HH:mm:ss') +
        '] ' +
        args.join(' ')
    )
  },
}

// 将 logger 挂载到全局
global.logger = logger
