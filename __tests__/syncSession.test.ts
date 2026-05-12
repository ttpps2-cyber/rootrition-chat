import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabaseServer', () => ({
  supabaseServer: {
    from: vi.fn(),
  },
}))

import { supabaseServer } from '../lib/supabaseServer'
import {
  upsertSession,
  saveMessage,
  linkEmail,
  resumeBySessionId,
  resumeByEmail,
} from '../lib/syncSession'
import { UserProfile } from '../types/chat'

const mockProfile: UserProfile = {
  disease: 'UC',
  status: 'active',
  medications: [],
  bioMedText: '',
  ageGroup: 'adult',
  concerns: [],
}

function makeChain(returnValue: unknown) {
  const chain = {
    upsert: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(returnValue),
    then: undefined as unknown,
  }
  ;(chain as Record<string, unknown>).then = undefined
  return chain
}

describe('upsertSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('session_id로 upsert하고 id를 반환한다', async () => {
    const chain = makeChain({ data: { id: 'abc-123' }, error: null })
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    const id = await upsertSession({
      sessionId: 'sess-1',
      userProfile: mockProfile,
      recommendedSku: 'UC',
    })

    expect(supabaseServer.from).toHaveBeenCalledWith('chat_sessions')
    expect(id).toBe('abc-123')
  })

  it('Supabase 에러 시 에러를 던진다', async () => {
    const chain = makeChain({ data: null, error: { message: 'db error' } })
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    await expect(
      upsertSession({ sessionId: 'sess-1', userProfile: mockProfile, recommendedSku: 'UC' })
    ).rejects.toThrow('db error')
  })
})

describe('saveMessage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chat_messages에 insert한다', async () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    }
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    await expect(
      saveMessage({ chatSessionId: 'uuid-1', role: 'user', content: '안녕하세요' })
    ).resolves.toBeUndefined()

    expect(supabaseServer.from).toHaveBeenCalledWith('chat_messages')
    expect(chain.insert).toHaveBeenCalledWith({
      session_id: 'uuid-1',
      role: 'user',
      content: '안녕하세요',
    })
  })
})

describe('linkEmail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('session_id로 email을 업데이트한다', async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    }
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    await expect(
      linkEmail({ sessionId: 'sess-1', email: 'user@test.com' })
    ).resolves.toBeUndefined()

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@test.com' })
    )
  })
})

describe('resumeBySessionId', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sessionId로 세션을 찾으면 ResumedSession을 반환한다', async () => {
    const sessionRow = {
      id: 'uuid-sess',
      user_profile: mockProfile,
      recommended_sku: 'UC',
    }
    const chain = makeChain({ data: sessionRow, error: null })
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    const result = await resumeBySessionId('sess-1')
    expect(result).not.toBeNull()
    expect(result?.chatSessionId).toBe('uuid-sess')
    expect(result?.recommendedSku).toBe('UC')
  })

  it('세션이 없으면 null을 반환한다', async () => {
    const chain = makeChain({ data: null, error: null })
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    const result = await resumeBySessionId('nonexistent')
    expect(result).toBeNull()
  })
})

describe('resumeByEmail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('email로 세션을 찾으면 ResumedSession을 반환한다', async () => {
    const sessionRow = {
      id: 'uuid-sess',
      user_profile: mockProfile,
      recommended_sku: 'Remission',
    }
    const chain = makeChain({ data: sessionRow, error: null })
    vi.mocked(supabaseServer.from).mockReturnValue(chain as ReturnType<typeof supabaseServer.from>)

    const result = await resumeByEmail('user@test.com')
    expect(result).not.toBeNull()
    expect(result?.recommendedSku).toBe('Remission')
  })
})
