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
  warn: function () {
    info(chalk.yellow(' ∆ ' + [].slice.call(arguments).join(' ')))
  },
  error: function () {
    info(
      chalk.bold.red(' X '),
      chalk.bold.red([].slice.call(arguments).join(' '))
    )
  },
  info: function () {
    console.log(chalk.cyan('[auto-i18n] '), [].slice.call(arguments).join(' '))
  },
  debug: function () {
    console.log(chalk.gray('[debug] '), [].slice.call(arguments).join(' '))
  },
  logWithTime: function () {
    info(
      chalk.cyan('[auto-i18n] ') +
        ' [' +
        dayjs().format('YY.MM.DD HH:mm:ss') +
        '] ' +
        [].slice.call(arguments).join(' ')
    )
  },
}
