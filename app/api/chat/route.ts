import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { buildSystemPrompt } from '../../../lib/systemPrompt'
import { UserProfile, SkuRecommendation } from '../../../types/chat'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, userProfile, recommendation } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    userProfile: UserProfile
    recommendation: SkuRecommendation
  }

  const systemPrompt = buildSystemPrompt(userProfile, recommendation)

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
