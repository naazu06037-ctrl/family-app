'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SetupContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('')
  const [googleConnected, setGoogleConnected] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'google') {
      setStatus('Google カレンダーの連携が完了しました！')
      setGoogleConnected(true)
    }
    if (error) {
      setStatus('エラーが発生しました: ' + error)
    }

    // 連携状態を確認
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => setGoogleConnected(data.googleConnected))
      .catch(() => {})
  }, [searchParams])

  const handleGoogleConnect = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-5 mb-5 text-white shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>⚙️</span> 設定
        </h1>
        <p className="text-sm opacity-80 mt-1">各サービスの連携設定</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl mb-4 text-sm ${
          status.includes('完了') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status}
        </div>
      )}

      {/* Google カレンダー */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📅</span>
          <div>
            <h2 className="font-bold text-gray-800">Google カレンダー</h2>
            <p className="text-xs text-gray-500">今日の予定表示とLINE通知に使用</p>
          </div>
        </div>
        {googleConnected ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <span>✅</span>
            <span className="text-sm font-medium">連携済み</span>
          </div>
        ) : (
          <button
            onClick={handleGoogleConnect}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold active:bg-blue-600"
          >
            Google アカウントで連携する
          </button>
        )}
      </div>

      {/* LINE設定説明 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">💬</span>
          <div>
            <h2 className="font-bold text-gray-800">LINE 朝6時通知</h2>
            <p className="text-xs text-gray-500">毎朝6時に今日の予定をLINEに送信</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 space-y-2">
          <p className="font-medium">設定方法：</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>LINE Developers でチャンネルを作成</li>
            <li>「チャンネルアクセストークン」をコピー</li>
            <li>作成したボットに友達追加</li>
            <li>Vercel の環境変数に設定</li>
          </ol>
          <p className="text-xs text-blue-500 mt-2">
            詳しい手順はセットアップガイドを参照してください
          </p>
        </div>
      </div>

      {/* 子供の名前設定 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">👶</span>
          <div>
            <h2 className="font-bold text-gray-800">子供の名前</h2>
            <p className="text-xs text-gray-500">アプリ内で使用する名前</p>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">
          <p>子供の名前は環境変数 <code className="bg-yellow-100 px-1 rounded">KID1_NAME</code> と <code className="bg-yellow-100 px-1 rounded">KID2_NAME</code> で設定できます。</p>
          <p className="mt-1 text-xs">Vercel の設定画面から変更してください。</p>
        </div>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">読み込み中...</div>}>
      <SetupContent />
    </Suspense>
  )
}
