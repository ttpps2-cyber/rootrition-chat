import { NextRequest, NextResponse } from 'next/server'
import { saveLead, LeadData } from '../../../lib/leadWebhook'

export async function POST(req: NextRequest) {
  const data = await req.json() as LeadData

  if (!data.email || !data.email.includes('@')) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다' }, { status: 400 })
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[/api/lead] LEAD_WEBHOOK_URL 환경변수 미설정')
    return NextResponse.json({ success: true })
  }

  await saveLead(data, webhookUrl)
  return NextResponse.json({ success: true })
}
