import { TransformFileType } from '@/constants'
import { isDirectory, travelDir } from '@/utils'
import { TransformFileTypes } from '@/types'
import { Command } from 'commander'

export default (program: Command) => {
  program
    .command('transform <filepath>')
    .description(
      '将输入的语言映射文件或文件夹进行格式转换，可转换为js、ts、json和excel格式'
    )
    .option(
      '-t, --to [fileType]',
      '指定转换为[fileType]格式，默认为excel',
      TransformFileType.EXCEL
    )
    .action(
      async (filepath: string, options: { fileType: TransformFileTypes }) => {
        const { fileType = TransformFileType.EXCEL } = options
        console.log('🚀 ~ fileType:', fileType)
        if (isDirectory(filepath)) {
          travelDir(filepath, (path) => {
            console.log(path)
          })
        } else {
        }
      }
    )
}
