import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { NextRequest } from 'next/server'
import { buildSystemPrompt } from '../../../lib/systemPrompt'
import { UserProfile, SkuRecommendation } from '../../../types/chat'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, userProfile, recommendation } = await req.json() as {
    messages: UIMessage[]
    userProfile: UserProfile
    recommendation: SkuRecommendation
  }

  const systemPrompt = buildSystemPrompt(userProfile, recommendation)

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
