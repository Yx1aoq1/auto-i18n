import fs from 'fs-extra'
import path from 'path'
/**
 * 文件拦截器
 */
export class FileInterceptor {
  private capturedFileContents: Record<string, string> = {}

  constructor() {}

  /**
   * 设置文件写入拦截器
   * 用于捕获测试过程中的所有文件写入操作
   */
  setupFileInterceptor(): void {
    // 重置捕获的文件内容
    this.capturedFileContents = {}
    // 模拟fs-extra的writeFileSync方法
    jest.spyOn(fs, 'writeFileSync').mockImplementation((filepath, content) => {
      const pathStr = filepath.toString()
      // 捕获所有文件写入操作
      this.capturedFileContents[pathStr] = content.toString()
      return undefined // writeFileSync不返回值
    })
    // 模拟fs-extra的writeFile方法
    jest
      .spyOn(fs, 'writeFile')
      .mockImplementation(
        (
          filepath,
          data,
          optionsOrCallback: any,
          callback?: (err: NodeJS.ErrnoException | null) => void
        ) => {
          const absPathStr = filepath.toString()

          // 使用 process.cwd() 获取相对路径
          const relativePath = path.relative(process.cwd(), absPathStr)

          // 转换为 POSIX 风格路径（使用 / 分隔）
          const normalizedPath = relativePath
            .split(path.sep)
            .join(path.posix.sep)
          // 处理多种调用形式
          let cb: ((err: NodeJS.ErrnoException | null) => void) | undefined =
            callback
          if (typeof optionsOrCallback === 'function') {
            cb = optionsOrCallback
          }

          // 捕获所有文件写入
          this.capturedFileContents[normalizedPath] = data.toString()

          // 如果提供了回调，调用它
          if (cb) cb(null)

          // 返回resolved promise保持异步接口
          return Promise.resolve()
        }
      )
  }

  /**
   * 清理文件拦截器
   */
  cleanupFileInterceptor(): void {
    jest.restoreAllMocks()
  }

  // 重载定义
  getCapturedFileContents<T extends string>(filepath: T): string
  getCapturedFileContents(): Record<string, string>
  /**
   * 获取捕获的文件内容
   */
  getCapturedFileContents(filepath?: string): string | Record<string, string> {
    return filepath
      ? this.capturedFileContents[filepath]
      : this.capturedFileContents
  }
}
