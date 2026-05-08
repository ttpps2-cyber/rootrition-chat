import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../lib/systemPrompt'
import { UserProfile, SkuRecommendation } from '../types/chat'

const profile: UserProfile = {
  disease: 'UC',
  status: 'remission',
  medications: ['메살라진'],
  bioMedText: '',
  ageGroup: 'adult',
  concerns: ['관해 유지·재발 예방'],
}

const recommendation: SkuRecommendation = { primary: 'Remission' }

describe('buildSystemPrompt', () => {
  it('루트리션 페르소나 텍스트 포함', () => {
    const prompt = buildSystemPrompt(profile, recommendation)
    expect(prompt).toContain('루트리션(Rootrition)')
  })

  it('SKU 지식베이스 포함', () => {
    const prompt = buildSystemPrompt(profile, recommendation)
    expect(prompt).toContain('CGMP 30g/일')
  })

  it('사용자 진단 정보 주입', () => {
    const prompt = buildSystemPrompt(profile, recommendation)
    expect(prompt).toContain('궤양성 대장염(UC)')
  })

  it('추천 SKU 주입', () => {
    const prompt = buildSystemPrompt(profile, recommendation)
    expect(prompt).toContain('Remission')
  })

  it('스테로이드 투약 시 칼슘·비타민D 언급 지시 포함', () => {
    const steroidProfile: UserProfile = { ...profile, medications: ['스테로이드'] }
    const prompt = buildSystemPrompt(steroidProfile, recommendation)
    expect(prompt).toContain('칼슘·비타민D')
  })

  it('스테로이드 미투약 시 칼슘·비타민D 미포함', () => {
    const prompt = buildSystemPrompt(profile, recommendation)
    expect(prompt).not.toContain('칼슘·비타민D')
  })

  it('금지 표현 룰셋 포함', () => {
    const prompt = buildSystemPrompt(profile, recommendation)
    expect(prompt).toContain('완치')
  })
})
