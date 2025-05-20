# My CLI Tool

一个基于 Commander.js 的命令行工具示例项目。

## 安装

```bash
npm install
npm link  # 全局安装命令
```

## 使用方法

```bash
# 运行示例命令
my-cli example 张三 --debug
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run start -- example 张三

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint        # 检查代码
npm run lint:fix    # 自动修复代码问题

# 代码格式化
npm run format      # 格式化代码
npm run format:check # 检查代码格式
```

## 项目结构

```
my-cli-tool/
├── bin/          # 编译后的可执行文件入口
├── src/          # TypeScript 源代码
│   ├── commands/ # 命令模块
│   └── utils/    # 工具函数
├── test/         # 测试文件
└── dist/         # 编译后的 JavaScript 文件
```

## 代码规范

本项目使用 ESLint 和 Prettier 进行代码规范和格式化：

- ESLint 配置：`.eslintrc.js`
- Prettier 配置：`.prettierrc`
- 忽略文件：`.eslintignore` 和 `.prettierignore`
