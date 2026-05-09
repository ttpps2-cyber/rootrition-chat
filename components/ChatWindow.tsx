'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { UserProfile, SkuRecommendation, AppPhase, Message } from '@/types/chat'
import { routeToSku } from '@/lib/skuRouter'
import MessageBubble from './MessageBubble'
import OnboardingStep from './OnboardingStep'
import MedicationCheckboxes from './MedicationCheckboxes'
import SkuCard from './SkuCard'
import LeadCapture from './LeadCapture'

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '안녕하세요. 루트리션입니다.\nIBD 환자분께 맞는 영양 정보를 드리기 위해 몇 가지 여쭤볼게요.',
}

const EMPTY_PROFILE: Partial<UserProfile> = {
  medications: [],
  bioMedText: '',
  concerns: [],
}

export default function ChatWindow() {
  const [appPhase, setAppPhase] = useState<AppPhase>('onboarding')
  const [onboardingStep, setOnboardingStep] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q1')
  const [partialProfile, setPartialProfile] = useState<Partial<UserProfile>>(EMPTY_PROFILE)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recommendation, setRecommendation] = useState<SkuRecommendation | null>(null)
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  const [q2Status, setQ2Status] = useState<string[]>([])
  const [q2Meds, setQ2Meds] = useState<string[]>([])
  const [bioMedText, setBioMedText] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const assistantCount = useRef(0)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { userProfile, recommendation },
    onFinish: () => {
      assistantCount.current += 1
      if (assistantCount.current >= 2) {
        setTimeout(() => setAppPhase('lead-capture'), 1000)
      }
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, appPhase, onboardingStep])

  function handleQ1Select(value: string) {
    setPartialProfile(p => ({ ...p, disease: value as UserProfile['disease'] }))
    setOnboardingStep('q2')
  }

  function handleQ2StatusSelect(value: string) {
    setQ2Status([value])
  }

  function handleQ2MedToggle(value: string) {
    if (value === '없음') {
      setQ2Meds(['없음'])
      return
    }
    setQ2Meds(prev =>
      prev.includes(value)
        ? prev.filter(m => m !== value && m !== '없음')
        : [...prev.filter(m => m !== '없음'), value]
    )
  }

  function handleQ2Confirm() {
    if (q2Status.length === 0) return
    const meds = q2Meds.filter(m => m !== '없음')
    setPartialProfile(p => ({
      ...p,
      status: q2Status[0] as UserProfile['status'],
      medications: meds,
      bioMedText: meds.includes('생물학적 제제') ? bioMedText : '',
    }))
    setOnboardingStep('q3')
  }

  function handleQ3Select(value: string) {
    setPartialProfile(p => ({ ...p, ageGroup: value as UserProfile['ageGroup'] }))
    setOnboardingStep('q4')
  }

  function handleQ4Toggle(value: string) {
    setPartialProfile(p => ({
      ...p,
      concerns: (p.concerns ?? []).includes(value)
        ? (p.concerns ?? []).filter(c => c !== value)
        : [...(p.concerns ?? []), value],
    }))
  }

  function handleQ4Confirm() {
    const profile: UserProfile = {
      disease: partialProfile.disease ?? 'unknown',
      status: partialProfile.status ?? 'remission',
      medications: partialProfile.medications ?? [],
      bioMedText: partialProfile.bioMedText ?? '',
      ageGroup: partialProfile.ageGroup ?? 'adult',
      concerns: partialProfile.concerns ?? [],
    }
    const rec = routeToSku(profile)
    setUserProfile(profile)
    setRecommendation(rec)
    setAppPhase('sku-recommendation')
    setTimeout(() => setAppPhase('chat'), 500)
  }

  return (
    <div className="flex flex-col h-full max-w-[680px] mx-auto">
      <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <span className="text-green-600 font-bold text-sm">R</span>
        </div>
        <div>
          <div className="font-bold text-base">루트리션</div>
          <div className="text-xs opacity-80">IBD 맞춤 영양 상담</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 flex flex-col gap-4">
        <MessageBubble message={WELCOME_MESSAGE} />

        {appPhase === 'onboarding' && (
          <>
            {onboardingStep === 'q1' && (
              <OnboardingStep
                question="먼저 진단받으신 질환을 알려주세요."
                options={[
                  { label: '크론병(CD)', value: 'CD' },
                  { label: '궤양성 대장염(UC)', value: 'UC' },
                  { label: '분류 미정 / 모름', value: 'unknown' },
                ]}
                selected={partialProfile.disease ? [partialProfile.disease] : []}
                onSelect={handleQ1Select}
              />
            )}
            {onboardingStep === 'q2' && (
              <>
                <OnboardingStep
                  question="현재 증상 상태는 어떠신가요?"
                  options={[
                    { label: '활동기 — 최근 증상 있음', value: 'active' },
                    { label: '관해기 — 비교적 안정적', value: 'remission' },
                  ]}
                  selected={q2Status}
                  onSelect={handleQ2StatusSelect}
                />
                {q2Status.length > 0 && (
                  <MedicationCheckboxes
                    selected={q2Meds}
                    bioMedText={bioMedText}
                    onToggle={handleQ2MedToggle}
                    onBioMedTextChange={setBioMedText}
                    onConfirm={handleQ2Confirm}
                  />
                )}
              </>
            )}
            {onboardingStep === 'q3' && (
              <OnboardingStep
                question="연령대를 알려주세요. 소아·청소년 전용 처방이 따로 있습니다."
                options={[
                  { label: '만 18세 이상 (성인)', value: 'adult' },
                  { label: '만 18세 미만 (소아·청소년)', value: 'pediatric' },
                ]}
                selected={partialProfile.ageGroup ? [partialProfile.ageGroup] : []}
                onSelect={handleQ3Select}
              />
            )}
            {onboardingStep === 'q4' && (
              <OnboardingStep
                question="가장 신경 쓰이는 부분을 골라주세요. (복수 선택 가능)"
                options={[
                  { label: '체중·근육량 감소', value: '체중·근육량 감소' },
                  { label: '영양 부족·단백질 보충', value: '영양 부족·단백질 보충' },
                  { label: '관해 유지·재발 예방', value: '관해 유지·재발 예방' },
                  { label: '먹을 수 있는 음식이 너무 제한됨', value: '먹을 수 있는 음식이 너무 제한됨' },
                ]}
                multiSelect
                selected={partialProfile.concerns ?? []}
                onSelect={handleQ4Toggle}
                onConfirm={handleQ4Confirm}
              />
            )}
          </>
        )}

        {(appPhase === 'sku-recommendation' || appPhase === 'chat' || appPhase === 'lead-capture' || appPhase === 'lead-submitted') && recommendation && (
          <SkuCard recommendation={recommendation} />
        )}

        {(appPhase === 'chat' || appPhase === 'lead-capture' || appPhase === 'lead-submitted') && messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={{ id: m.id, role: m.role as 'user' | 'assistant', content: m.content }}
          />
        ))}

        {appPhase === 'lead-capture' && !leadSubmitted && userProfile && recommendation && (
          <LeadCapture
            userProfile={userProfile}
            recommendation={recommendation}
            onSubmitted={() => {
              setLeadSubmitted(true)
              setAppPhase('lead-submitted')
            }}
          />
        )}

        {appPhase === 'lead-submitted' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            등록해주셔서 감사합니다. 루트리션 출시 소식을 가장 먼저 전해드리겠습니다.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {(appPhase === 'chat' || appPhase === 'lead-capture' || appPhase === 'lead-submitted') && (
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="IBD 영양에 대해 자유롭게 질문해주세요..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 disabled:opacity-40"
          >
            전송
          </button>
        </form>
      )}
    </div>
  )
}
