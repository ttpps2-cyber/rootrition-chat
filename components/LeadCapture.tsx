'use client'

import { useState } from 'react'
import { UserProfile, SkuRecommendation } from '@/types/chat'

interface Props {
  userProfile: UserProfile
  recommendation: SkuRecommendation
  onSubmitted: () => void
}

export default function LeadCapture({ userProfile, recommendation, onSubmitted }: Props) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.')
      return
    }
    setIsLoading(true)
    setError('')

    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        disease: userProfile.disease,
        status: userProfile.status,
        medications: userProfile.medications.join(', '),
        recommendedSku: recommendation.primary,
      }),
    })

    setIsLoading(false)
    onSubmitted()
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <p className="font-semibold text-sm text-gray-800 mb-1">출시 알림 받기</p>
      <p className="text-xs text-gray-500 mb-3">루트리션 출시 소식을 가장 먼저 받아보세요.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="flex-1 border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? '...' : '등록'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
