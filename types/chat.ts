export type Disease = 'UC' | 'CD' | 'unknown'
export type SymptomStatus = 'active' | 'remission'
export type AgeGroup = 'adult' | 'pediatric'
export type SkuName = 'UC' | 'CD Active' | 'Remission' | 'Pediatric' | 'Sarcopenia+'

export interface UserProfile {
  disease: Disease
  status: SymptomStatus
  medications: string[]      // ['메살라진', '스테로이드'] 등
  bioMedText: string         // 생물학적제제/소분자제제 직접 입력값
  ageGroup: AgeGroup
  concerns: string[]         // ['체중·근육량 감소', '관해 유지·재발 예방'] 등
}

export interface SkuRecommendation {
  primary: SkuName
  secondary?: SkuName        // Sarcopenia+ 병기 시 사용
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type OnboardingPhase = 'q1' | 'q2' | 'q3' | 'q4'

export type AppPhase =
  | 'onboarding'
  | 'sku-recommendation'
  | 'chat'
  | 'lead-capture'
  | 'lead-submitted'

export interface ChatSession {
  id: string           // chat_sessions.id (UUID)
  sessionId: string    // localStorage UUID
  email: string | null
  userProfile: UserProfile
  recommendedSku: string
  createdAt: string
  updatedAt: string
}

export interface ResumedSession {
  chatSessionId: string  // chat_sessions.id
  userProfile: UserProfile
  recommendedSku: string
}
