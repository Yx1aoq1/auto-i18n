# 📦 auto-i18n

> 用于提取与替换项目中需要国际化的文案

---

## ✨ 特性

- ✅ 功能一：自动提取文案并生成对应的语言包文件，支持格式：json/js/ts
- ✅ 功能二：自动将文案替换为i18n方法，如`$t('xxx')`，`i18n.t('xxx')`等
- ✅ 功能三：支持vue/react项目的文案提取和替换

---

## 📦 安装

### 使用 npm / yarn / pnpm

```bash
npm install -g auto-i18n-tools
# or
yarn global add auto-i18n-tools
# or
pnpm add -g auto-i18n-tools
```

## 🚀 使用方法

```bash
auto-i18n pick <filepath>
```

or

```bash
auto-i18n replace <filepath>
```

## ⚙️ 配置说明

执行前需要在项目根目录下创建一个`i18n.config.js`文件配置相关的配置信息，如：

```js
module.exports = {
  sourceLanguage: 'zh-cn',
  localesPaths: ['example/locales'],
  namespace: false,
  pathMatcher: '{locale}.{ext}',
}
```

### 参数说明

| 参数              | 说明                                                                                         | 类型             | 默认值           |
| ----------------- | -------------------------------------------------------------------------------------------- | ---------------- | ---------------- |
| sourceLanguage    | 源语言，需要匹配的语言类型                                                                   | string           | 'zh-cn'          |
| localesPaths      | 配置的语言包所在的路径                                                                       | string[]         | -                |
| namespace         | 是否有命名空间                                                                               | boolean          | -                |
| pathMatcher       | 语言包文件名称匹配                                                                           | string           | -                |
| ignoreFiles       | 读取语言包时需要忽略的文件夹配置                                                             | string[]         |                  |
| includeSubfolders | 是否检索localesPaths配置下的子文件夹                                                         | boolean          | true             |
| keyStyle          | _flat({"a.b.c": "..."}) or nested({"a": {"b": {"c": "..."}}})_                               | 'flat'\|'nested' | ‘flat'           |
| expressionTmp     | 参数模板格式，expression 表示中间要替换的参数名称，例如： `{{expression}}` / `${expression}` | string           | '{expression}'   |
| i18nFuncTemp      | 国际化的i18n方法 如` i18n.t({key})`                                                          | string\|function | 'i18n.$t({key})' |

## 📘 使用示例
