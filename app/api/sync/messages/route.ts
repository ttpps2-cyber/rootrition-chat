import { NextRequest, NextResponse } from 'next/server'
import { saveMessage } from '../../../../lib/syncSession'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { chatSessionId, role, content } = await req.json() as {
      chatSessionId: string
      role: 'user' | 'assistant'
      content: string
    }

    if (!chatSessionId || !role || !content) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    await saveMessage({ chatSessionId, role, content })
    return new NextResponse(null, { status: 201 })
  } catch (e) {
    console.error('[api/sync/messages]', e)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
