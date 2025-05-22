import fs from 'fs-extra'

// 用于存储捕获的文件内容
export let capturedFileContents: Record<string, string> = {}

/**
 * 设置文件写入拦截器
 * 用于捕获测试过程中的所有文件写入操作
 */
export function setupFileInterceptor(): void {
  // 重置捕获的文件内容
  capturedFileContents = {}

  // 模拟fs-extra的writeFileSync方法
  jest.spyOn(fs, 'writeFileSync').mockImplementation((filepath, content) => {
    const pathStr = filepath.toString()
    // 捕获所有文件写入操作
    capturedFileContents[pathStr] = content.toString()
    return undefined // writeFileSync不返回值
  })

  // 模拟fs-extra的writeFile方法
  jest
    .spyOn(fs, 'writeFile')
    .mockImplementation(
      (
        path,
        data,
        optionsOrCallback: any,
        callback?: (err: NodeJS.ErrnoException | null) => void
      ) => {
        const pathStr = path.toString()
        // 处理多种调用形式
        let cb: ((err: NodeJS.ErrnoException | null) => void) | undefined =
          callback
        if (typeof optionsOrCallback === 'function') {
          cb = optionsOrCallback
        }

        // 捕获所有文件写入
        capturedFileContents[pathStr] = data.toString()

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
export function cleanupFileInterceptor(): void {
  jest.restoreAllMocks()
}

/**
 * 获取捕获的文件内容
 */
export function getCapturedFileContents(): Record<string, string> {
  return capturedFileContents
}
