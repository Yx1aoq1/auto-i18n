import React from 'react'

// const myTest = () => {
//   const template = `模版语法测试 ${value} 简短简单`
// }

const SimpleTest: React.FC = () => {
  // 测试 JSX 中的中文文本，包括复杂的嵌套表达式
  return <div>中文包裹着变量 {value} 哈哈哈哈哈</div>
}

export default SimpleTest
