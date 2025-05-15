import React, { useState, useEffect } from 'react'
import { message } from 'antd'

interface UserData {
  firstName: string
  lastName: string
  age: number
  role: string
  lastLogin: string
  notifications: {
    total: number
    unread: number
    important: number
  }
  preferences: {
    language: string
    theme: string
  }
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // 测试普通字符串中的中文
  const welcomeText = '欢迎回来！'

  // 测试模板字符串中的中文和多个变量
  const getGreeting = (firstName: string, lastName: string) => `尊敬的 ${lastName}${firstName} 用户，欢迎您第${userData?.notifications.total}次访问我们的平台！`

  // 测试多行模板字符串和多个变量
  const getNotificationText = (unread: number, important: number) => `
    您的通知摘要：
    1. 您有 ${unread} 条未读消息
    2. 其中 ${important} 条重要消息需要及时处理
    3. 请在 ${new Date().toLocaleDateString()} 之前处理完毕
  `

  useEffect(() => {
    // 测试对象中的中文
    const mockData: UserData = {
      firstName: '小明',
      lastName: '王',
      age: 28,
      role: '高级工程师',
      lastLogin: '2023-10-01',
      notifications: {
        total: 100,
        unread: 5,
        important: 2
      },
      preferences: {
        language: '简体中文',
        theme: '深色模式'
      }
    }

    setTimeout(() => {
      setUserData(mockData)
      setLoading(false)
      // 测试函数调用中的中文
      message.success('数据加载成功！')
    }, 1000)
  }, [])

  // 测试条件渲染中的中文
  if (loading) {
    return <div className="loading-wrapper">正在加载用户信息...</div>
  }

  // 测试 JSX 中的中文文本，包括复杂的嵌套表达式
  return (
    <div className="user-profile">
      <div className="welcome-section">
        {/* 测试多个表达式混合的情况 */}
        欢迎{userData?.firstName} {userData?.lastName}回来，您有{userData?.notifications.unread}条未读消息， 其中{userData?.notifications.important}条重要消息
      </div>

      <h1>用户信息</h1>
      {userData && (
        <>
          {/* 测试表达式前后的中文 */}
          <div className="info-item">
            这是{userData.lastName}
            {userData.firstName}的个人主页
          </div>

          {/* 测试表达式中间的中文 */}
          <div className="info-item">
            <label>年龄：</label>
            <span>
              {userData.age}岁，担任{userData.role}职位
            </span>
          </div>

          {/* 测试多个表达式和中文混合 */}
          <div className="notification-item">
            系统显示：从{userData.lastLogin}至今，您总共访问了{userData.notifications.total}次， 最近{userData.notifications.unread}条消息待处理
          </div>

          {/* 测试表达式和中文的各种组合 */}
          <div className="preference-item">
            您的偏好设置：使用{userData.preferences.language}， 界面风格为{userData.preferences.theme}， 已经保持了{userData.notifications.total}天
          </div>

          {/* 测试表达式中的中文 */}
          <div className="greeting">{getGreeting(userData.firstName, userData.lastName)}</div>

          {/* 测试注释中的中文 - 这个不应该被替换 */}
          <div className="notification">{getNotificationText(userData.notifications.unread, userData.notifications.important)}</div>

          <button onClick={() => message.info('个人信息已经是最新的！')} className="update-btn">
            立即更新个人信息
          </button>
        </>
      )}
    </div>
  )
}

export default UserProfile
