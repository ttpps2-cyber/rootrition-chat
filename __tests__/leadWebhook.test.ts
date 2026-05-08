import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveLead, LeadData } from '../lib/leadWebhook'

const mockData: LeadData = {
  email: 'test@example.com',
  disease: '궤양성 대장염(UC)',
  status: '관해기',
  medications: '메살라진',
  recommendedSku: 'Remission',
}

describe('saveLead', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('웹훅 URL로 POST 요청을 보낸다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true } as Response)
    vi.stubGlobal('fetch', mockFetch)

    await saveLead(mockData, 'https://script.google.com/test')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://script.google.com/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('body에 registeredAt 타임스탬프가 포함된다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true } as Response)
    vi.stubGlobal('fetch', mockFetch)

    await saveLead(mockData, 'https://script.google.com/test')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.registeredAt).toBeDefined()
    expect(body.email).toBe('test@example.com')
  })

  it('웹훅 실패 시 throw하지 않는다 (사용자에게 노출 금지)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Error' } as Response)
    vi.stubGlobal('fetch', mockFetch)

    await expect(saveLead(mockData, 'https://script.google.com/test')).resolves.not.toThrow()
  })
})
