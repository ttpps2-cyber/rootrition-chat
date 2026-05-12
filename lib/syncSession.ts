import { supabaseServer } from './supabaseServer'
import { UserProfile, ResumedSession } from '@/types/chat'

export async function upsertSession(params: {
  sessionId: string
  userProfile: UserProfile
  recommendedSku: string
}): Promise<string> {
  const { data, error } = await supabaseServer
    .from('chat_sessions')
    .upsert(
      {
        session_id: params.sessionId,
        user_profile: params.userProfile,
        recommended_sku: params.recommendedSku,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    )
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id
}

export async function saveMessage(params: {
  chatSessionId: string
  role: 'user' | 'assistant'
  content: string
}): Promise<void> {
  const { error } = await supabaseServer.from('chat_messages').insert({
    session_id: params.chatSessionId,
    role: params.role,
    content: params.content,
  })
  if (error) console.warn('[syncSession] saveMessage failed:', error.message)
}

export async function linkEmail(params: {
  sessionId: string
  email: string
}): Promise<void> {
  const { error } = await supabaseServer
    .from('chat_sessions')
    .update({ email: params.email, updated_at: new Date().toISOString() })
    .eq('session_id', params.sessionId)
  if (error) console.warn('[syncSession] linkEmail failed:', error.message)
}

async function fetchSession(
  column: 'session_id' | 'email',
  value: string
): Promise<ResumedSession | null> {
  const { data: sessionRow, error } = await supabaseServer
    .from('chat_sessions')
    .select('id, user_profile, recommended_sku')
    .eq(column, value)
    .single()

  if (error || !sessionRow) return null

  return {
    chatSessionId: sessionRow.id,
    userProfile: sessionRow.user_profile as UserProfile,
    recommendedSku: sessionRow.recommended_sku,
  }
}

export async function resumeBySessionId(sessionId: string): Promise<ResumedSession | null> {
  return fetchSession('session_id', sessionId)
}

export async function resumeByEmail(email: string): Promise<ResumedSession | null> {
  return fetchSession('email', email)
}
