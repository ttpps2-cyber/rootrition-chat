import { NextRequest, NextResponse } from 'next/server'
import { linkEmail } from '../../../../../lib/syncSession'

export const runtime = 'edge'

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, email } = await req.json() as {
      sessionId: string
      email: string
    }

    if (!sessionId || !email) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    await linkEmail({ sessionId, email })
    return new NextResponse(null, { status: 200 })
  } catch (e) {
    console.error('[api/sync/session/email]', e)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
