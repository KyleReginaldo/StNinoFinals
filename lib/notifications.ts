// Simple TextBee notifier using fetch
// Requires the following environment variables:
// - TEXTBEE_API_KEY: API key for TextBee
// - TEXTBEE_API_URL: Base URL for TextBee API (e.g., https://api.textbee.com/v1)
// - TEXTBEE_SENDER_ID: Sender identifier or phone number assigned to your service

export async function sendSms(phone: string, message: string) {
  if (!phone) {
    console.warn('sendSms called without phone number')
    return false
  }

  const apiKey = process.env.TEXTBEE_API_KEY
  const apiUrl = process.env.TEXTBEE_API_URL || 'https://api.textbee.com/v1'
  const sender = process.env.TEXTBEE_SENDER_ID || process.env.TEXTBEE_SENDER || process.env.SMS_SENDER || null

  if (!apiKey) {
    console.warn('TEXTBEE_API_KEY is not configured; skipping SMS send')
    return false
  }

  try {
    const url = `${apiUrl.replace(/\/+$/,'')}/messages`
    const payload: any = {
      to: phone,
      message: message,
    }
    if (sender) payload.from = sender

    // Use global fetch (available in Node 18+)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('TextBee API error:', res.status, text)
      return false
    }

    try {
      const data = await res.json()
      console.log('TextBee sent msg, id:', data?.id || 'unknown')
    } catch (err) {
      // non-JSON response, still okay
    }

    return true
  } catch (err: any) {
    console.error('Failed to send SMS using TextBee:', err?.message || err)
    return false
  }
}
