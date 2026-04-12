'use client'

import { useEffect, useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  description?: string
}

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  const weekday = weekdays[today.getDay()]

  useEffect(() => {
    fetch('/api/calendar')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events)
        else setError(data.error || 'エラーが発生しました')
      })
      .catch(() => setError('カレンダーの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    })
  }

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 mb-5 text-white shadow-md">
        <p className="text-sm opacity-80">{weekday}</p>
        <h1 className="text-2xl font-bold">{dateStr}</h1>
        <p className="text-sm opacity-80 mt-1">今日もよい1日を！</p>
      </div>

      {/* 今日の予定 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📅</span> 今日の予定
        </h2>

        {loading && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-3xl mb-2">⏳</div>
            <p>読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-gray-500 text-sm">{error}</p>
            <a href="/setup" className="text-blue-500 text-sm mt-2 block">
              設定ページでGoogleカレンダーを連携する →
            </a>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-3xl mb-2">✅</div>
            <p>今日の予定はありません</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="bg-blue-500 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap mt-0.5">
                  {event.allDay ? '終日' : formatTime(event.start)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
