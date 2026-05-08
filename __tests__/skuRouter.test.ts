import { describe, it, expect } from 'vitest'
import { routeToSku } from '../lib/skuRouter'
import { UserProfile } from '../types/chat'

const base: UserProfile = {
  disease: 'UC',
  status: 'active',
  medications: [],
  bioMedText: '',
  ageGroup: 'adult',
  concerns: [],
}

describe('routeToSku', () => {
  it('UC 선택 → primary: UC', () => {
    expect(routeToSku({ ...base, disease: 'UC', status: 'active' }).primary).toBe('UC')
  })

  it('UC + 관해기 + 성인 → primary: Remission', () => {
    expect(routeToSku({ ...base, disease: 'UC', status: 'remission' }).primary).toBe('Remission')
  })

  it('CD + 활동기 → primary: CD Active', () => {
    expect(routeToSku({ ...base, disease: 'CD', status: 'active' }).primary).toBe('CD Active')
  })

  it('CD + 관해기 + 성인 → primary: Remission', () => {
    expect(routeToSku({ ...base, disease: 'CD', status: 'remission' }).primary).toBe('Remission')
  })

  it('소아 → primary: Pediatric (disease 무관)', () => {
    expect(routeToSku({ ...base, disease: 'CD', status: 'active', ageGroup: 'pediatric' }).primary).toBe('Pediatric')
  })

  it('체중·근육량 감소 고민 → secondary: Sarcopenia+', () => {
    const result = routeToSku({ ...base, concerns: ['체중·근육량 감소'] })
    expect(result.secondary).toBe('Sarcopenia+')
  })

  it('체중·근육량 감소 고민 없으면 secondary 없음', () => {
    const result = routeToSku({ ...base, concerns: ['관해 유지·재발 예방'] })
    expect(result.secondary).toBeUndefined()
  })

  it('분류 미정 + 활동기 → primary: CD Active', () => {
    expect(routeToSku({ ...base, disease: 'unknown', status: 'active' }).primary).toBe('CD Active')
  })

  it('분류 미정 + 관해기 → primary: Remission', () => {
    expect(routeToSku({ ...base, disease: 'unknown', status: 'remission' }).primary).toBe('Remission')
  })
})
