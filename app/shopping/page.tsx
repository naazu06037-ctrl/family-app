'use client'

import { useEffect, useState } from 'react'

interface ShoppingItem {
  id: string
  name: string
  checked: boolean
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchItems = () => {
    fetch('/api/shopping')
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return

    const res = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItem.trim() }),
    })
    if (res.ok) {
      setNewItem('')
      fetchItems()
    }
  }

  const toggleItem = async (id: string, checked: boolean) => {
    await fetch('/api/shopping', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, checked: !checked }),
    })
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !checked } : item)))
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/shopping?id=${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const uncheckedItems = items.filter((i) => !i.checked)
  const checkedItems = items.filter((i) => i.checked)

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 mb-5 text-white shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🛒</span> 買い物リスト
        </h1>
        <p className="text-sm opacity-80 mt-1">残り {uncheckedItems.length}件</p>
      </div>

      {/* 追加フォーム */}
      <form onSubmit={addItem} className="flex gap-2 mb-5">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="追加する商品を入力..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-green-500 text-white rounded-xl font-bold active:bg-green-600"
        >
          追加
        </button>
      </form>

      {loading && (
        <div className="text-center py-6 text-gray-400">読み込み中...</div>
      )}

      {/* 未購入リスト */}
      {uncheckedItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mb-4">
          <ul className="divide-y divide-gray-100">
            {uncheckedItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-4">
                <button
                  onClick={() => toggleItem(item.id, item.checked)}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center"
                />
                <span className="flex-1 text-gray-800">{item.name}</span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-400 text-xl"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 購入済みリスト */}
      {checkedItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm opacity-60">
          <p className="px-4 pt-3 text-xs text-gray-400 font-medium">購入済み</p>
          <ul className="divide-y divide-gray-100">
            {checkedItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-4">
                <button
                  onClick={() => toggleItem(item.id, item.checked)}
                  className="w-6 h-6 rounded-full bg-green-400 flex-shrink-0 flex items-center justify-center text-white text-sm"
                >
                  ✓
                </button>
                <span className="flex-1 text-gray-400 line-through">{item.name}</span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-400 text-xl"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">🛒</div>
          <p>買い物リストは空です</p>
        </div>
      )}
    </div>
  )
}
