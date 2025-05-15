import React from 'react'

const SimpleMessage = ({ user, stats }) => {
  // 测试普通字符串
  const title = '消息中心'

  // 测试模板字符串和多个变量
  const message = `亲爱的${user.title}${user.lastName}${user.firstName}，
    您的会员等级为${user.level}，
    本月已经为您节省了${stats.savedMoney}元`

  // 测试对象中的中文和表达式
  const notifications = {
    summary: `您有${stats.total}条消息，其中${stats.unread}条未读，${stats.important}条重要通知`,
    details: {
      today: `今日新增：${stats.today}条`,
      tasks: `待办事项：${stats.todos}个`,
      meetings: `未来安排：${stats.meetings}个会议`
    }
  }

  return (
    <div className="message-center">
      {/* 测试多个表达式混合的情况 */}
      <div className="user-welcome">
        欢迎回来，{user.title}
        {user.lastName}
        {user.firstName}！ 您已经连续登录{stats.loginDays}天， 是我们的{user.level}级会员
      </div>

      <h2>{title}</h2>

      {/* 测试表达式和中文混合 */}
      <div className="message-summary">
        尊敬的{user.lastName}用户，{notifications.summary}
      </div>

      {/* 测试多个表达式和中文的组合 */}
      <div className="notification-list">
        <div className="notification-item">
          {notifications.details.today}
          <span className="badge high">优先级：{stats.priority}</span>
        </div>
        <div className="notification-item">
          {notifications.details.tasks}
          <span className="badge">{stats.overdue}项已逾期</span>
        </div>
        <div className="notification-item">
          {notifications.details.meetings}
          <span className="badge">下一个会议：{stats.nextMeeting}</span>
        </div>
      </div>

      {/* 测试表达式前后的中文 */}
      <div className="vip-notice">
        尊敬的{user.level}级会员，您的{stats.points}积分即将到期， 建议在{stats.expiryDate}前使用
      </div>

      <div className="actions">
        <button onClick={() => alert('确定要清空所有消息吗？')}>清空{stats.unread}条未读消息</button>
        <button onClick={() => alert(`确定要处理${stats.todos}条待办事项吗？`)}>处理全部待办</button>
      </div>
    </div>
  )
}

export default SimpleMessage
