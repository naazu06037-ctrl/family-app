'use client'

import { useEffect, useState } from 'react'

interface KidEvent {
  id: string
  kid_name: string
  title: string
  event_date: string
  category: string
  description?: string
}

interface NewEvent {
  kid_name: string
  title: string
  event_date: string
  category: string
  description: string
}

const CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  event: { label: '行事', emoji: '🎒', color: 'bg-yellow-100 text-yellow-700' },
  document: { label: '書類', emoji: '📄', color: 'bg-blue-100 text-blue-700' },
  medical: { label: '病院・健康', emoji: '🏥', color: 'bg-red-100 text-red-700' },
  other: { label: 'その他', emoji: '📌', color: 'bg-gray-100 text-gray-600' },
}

const KID_NAMES = ['子供1', '子供2']

export default function KidsPage() {
  const [events, setEvents] = useState<KidEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newEvent, setNewEvent] = useState<NewEvent>({
    kid_name: KID_NAMES[0],
    title: '',
    event_date: '',
    category: 'event',
    description: '',
  })

  const fetchEvents = () => {
    fetch('/api/kids')
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title.trim() || !newEvent.event_date) return

    const res = await fetch('/api/kids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    })
    if (res.ok) {
      setShowForm(false)
      setNewEvent({ kid_name: KID_NAMES[0], title: '', event_date: '', category: 'event', description: '' })
      fetchEvents()
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch(`/api/kids?id=${id}`, { method: 'DELETE' })
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )

  const upcomingEvents = sortedEvents.filter(
    (e) => new Date(e.event_date) >= new Date(new Date().setHours(0, 0, 0, 0))
  )
  const pastEvents = sortedEvents.filter(
    (e) => new Date(e.event_date) < new Date(new Date().setHours(0, 0, 0, 0))
  )

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl p-5 mb-5 text-white shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>👶</span> 子供の情報
        </h1>
        <p className="text-sm opacity-80 mt-1">行事・書類・健康記録</p>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 mb-4 bg-pink-500 text-white rounded-xl font-bold active:bg-pink-600"
      >
        ＋ 予定・書類を追加
      </button>

      {/* 追加フォーム */}
      {showForm && (
        <form onSubmit={addEvent} className="bg-white rounded-2xl p-4 shadow-sm mb-5 space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">子供</label>
            <div className="flex gap-2">
              {KID_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, kid_name: name })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    newEvent.kid_name === name
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">カテゴリ</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, category: key })}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    newEvent.category === key
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {val.emoji} {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">タイトル *</label>
            <input
              type="text"
              required
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="例：運動会、健康診断書類提出"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">日付 *</label>
            <input
              type="date"
              required
              value={newEvent.event_date}
              onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">メモ</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="持ち物、連絡先など"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600"
            >
              キャンセル
            </button>
            <button type="submit" className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold">
              追加
            </button>
          </div>
        </form>
      )}

      {loading && <div className="text-center py-6 text-gray-400">読み込み中...</div>}

      {/* 今後の予定 */}
      {upcomingEvents.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">これからの予定</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const cat = CATEGORIES[event.category] || CATEGORIES.other
              return (
                <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800">{event.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
                            {event.kid_name}
                          </span>
                        </div>
                        <p className="text-sm text-blue-500 mt-0.5">{formatDate(event.event_date)}</p>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-gray-300 hover:text-red-400 text-xl flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 過去の記録 */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-2 px-1">過去の記録</h2>
          <div className="space-y-2 opacity-60">
            {pastEvents.slice(-5).reverse().map((event) => {
              const cat = CATEGORIES[event.category] || CATEGORIES.other
              return (
                <div key={event.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                  <span>{cat.emoji}</span>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 line-through">{event.title}</span>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(event.event_date)}</span>
                  </div>
                  <button onClick={() => deleteEvent(event.id)} className="text-gray-200 text-lg">×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">👶</div>
          <p>まだ予定・書類がありません</p>
        </div>
      )}
    </div>
  )
}
