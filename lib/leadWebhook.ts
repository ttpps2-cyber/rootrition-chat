export interface LeadData {
  email: string
  disease: string
  status: string
  medications: string
  recommendedSku: string
}

export async function saveLead(data: LeadData, webhookUrl: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, registeredAt: new Date().toISOString() }),
  })

  if (!response.ok) {
    console.error(`[leadWebhook] failed: ${response.status} ${response.statusText}`)
  }
}
