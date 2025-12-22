'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const signUp = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('確認メールを送信しました')
    }
  }

  const signIn = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">
          ログイン / 新規登録
        </h1>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full rounded-md border border-gray-300
              px-3 py-2 text-sm
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            "
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full rounded-md border border-gray-300
              px-3 py-2 text-sm
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            "
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={signIn}
            disabled={loading}
            className="
              flex-1 rounded-md bg-blue-600 px-4 py-2
              text-sm font-semibold text-white
              hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            ログイン
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="
              flex-1 rounded-md bg-gray-600 px-4 py-2
              text-sm font-semibold text-white
              hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            新規登録
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-sm text-red-600">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
