import axios from 'axios'

const LINE_API_URL = 'https://api.line.me/v2/bot/message/push'

export const sendLineMessage = async (userId: string, message: string) => {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN

  await axios.post(
    LINE_API_URL,
    {
      to: userId,
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const buildMorningMessage = (
  events: Array<{ title: string; start: string; allDay: boolean }>,
  shoppingCount: number
): string => {
  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[today.getDay()]

  let message = `🌅 おはようございます！\n${dateStr}（${weekday}）\n\n`

  if (events.length === 0) {
    message += '📅 今日の予定はありません\n'
  } else {
    message += '📅 今日の予定\n'
    events.forEach((event) => {
      if (event.allDay) {
        message += `・${event.title}（終日）\n`
      } else {
        const time = new Date(event.start).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Tokyo',
        })
        message += `・${time} ${event.title}\n`
      }
    })
  }

  if (shoppingCount > 0) {
    message += `\n🛒 買い物リスト: ${shoppingCount}件`
  }

  return message
}
