import { NextRequest, NextResponse } from 'next/server'
import { upsertSession } from '../../../../lib/syncSession'
import { UserProfile } from '../../../../types/chat'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userProfile, recommendedSku } = await req.json() as {
      sessionId: string
      userProfile: UserProfile
      recommendedSku: string
    }

    if (!sessionId || !userProfile || !recommendedSku) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const id = await upsertSession({ sessionId, userProfile, recommendedSku })
    return NextResponse.json({ id }, { status: 200 })
  } catch (e) {
    console.error('[api/sync/session]', e)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
