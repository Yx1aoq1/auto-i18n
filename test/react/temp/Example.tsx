import React from 'react'

interface DemoComponentProps {
  rule?: { required: boolean; message: string }
  array?: string[]
  a?: string
  b?: string
  text?: string
}

const DemoComponent: React.FC<DemoComponentProps> = () => null

const Example: React.FC = () => {
  // 测试普通字符串中的中文
  const welcomeText = '欢迎回来！'
  const value = '测试值'
  const value1 = '测试值1'
  const time = new Date()
  const name = '用户'
  const flag = true

  const fun = (text: string) => text
  const dateFormat = (date: Date) => date.toLocaleDateString()

  // 测试模板字符串中的中文和多个变量
  const getGreeting = (firstName: string, lastName: string) => `尊敬的 ${lastName}${firstName} 用户，欢迎您访问我们的平台！`

  // 测试多行模板字符串和多个变量
  const getNotificationText = (unread: number, important: number) => `
    您的通知摘要：
    1. 您有 ${unread} 条未读消息
    2. 其中 ${important} 条重要消息需要及时处理
    3. 请在 ${new Date().toLocaleDateString()} 之前处理完毕
  `

  // 测试 JSX 中的中文文本，包括复杂的嵌套表达式
  return (
    <div>
      {/* 普通的标签中 */}
      <div>纯文字替换</div>
      {/* 带空格的文字 */}
      <div> 带空格的文字 </div>
      {/* 带换行的文字 */}
      <div>带换行的文字</div>
      {/* 中文 + 变量 */}
      <div> 中文+变量显示：{value} </div>
      {/* 变量空格隔开 */}
      {flag && <div className={value}>会员将于 {value} 天后到期</div>}
      {/* 变量 + 中文 */}
      <div>
        {value}
        变量后的中文
      </div>
      {/* 中文 + 多个变量 */}
      <div>
        中文1{value1}中文2{fun('函数内部中文')}中文3{dateFormat(time)}
      </div>
      {/* 换行测试 */}
      <div>1.第一行 2.第二行 3.第三行</div>
      {/* 属性纯中文 */}
      <input placeholder="属性纯中文" />
      {/* 属性值为 `中文${变量}` */}
      <input placeholder={`ES6模板字符串${value}`} />
      {/* 属性值为 嵌套模板字符串 */}
      <input placeholder={`ES6模板字符串${fun(flag ? '中文字符串1' : `模板字符串2${value}`)}`} />
      {/* 属性值为对象 */}
      <DemoComponent rule={{ required: true, message: '不能为空' }} />
      {/* 属性值为数组 */}
      <DemoComponent array={['元素1', '元素2']} />
      {/* 多个属性中文测试 */}
      <DemoComponent a="中文a" b="中文b" />
      {/* 重复中文测试 */}
      <DemoComponent a="中文c" b="中文c" />
      {/* 测试属性表达式 */}
      <DemoComponent text={'你好' + name} />
    </div>
  )
}

export default Example
