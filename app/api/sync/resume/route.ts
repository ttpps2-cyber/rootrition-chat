import { NextRequest, NextResponse } from 'next/server'
import { resumeBySessionId, resumeByEmail } from '../../../../lib/syncSession'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const email = searchParams.get('email')

    if (!sessionId && !email) {
      return NextResponse.json({ error: 'sessionId or email required' }, { status: 400 })
    }

    const result = sessionId
      ? await resumeBySessionId(sessionId)
      : await resumeByEmail(email!)

    if (!result) {
      return NextResponse.json(null, { status: 200 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    console.error('[api/sync/resume]', e)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
