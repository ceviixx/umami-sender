const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function fetchInstances() {
  const res = await fetch(`${API_BASE}/umami`)
  if (!res.ok) throw new Error('Fehler beim Laden der Instanzen')
  return res.json()
}

export async function createInstance(data: any) {
  const res = await fetch(`${API_BASE}/umami`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Erstellen der Instanz')
  return res.json()
}

export async function updateInstance(id: number, data: any) {
  const res = await fetch(`${API_BASE}/umami/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Aktualisieren der Instanz')
  return res.json()
}

export async function deleteInstance(id: number) {
  const res = await fetch(`${API_BASE}/umami/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Fehler beim Löschen der Instanz')
}

export async function fetchInstance(id: number) {
  const res = await fetch(`${API_BASE}/umami/${id}`)
  if (!res.ok) throw new Error('Fehler beim Laden der Instanz')
  return res.json()
}



export async function fetchSenders() {
  const res = await fetch(`${API_BASE}/senders`)
  if (!res.ok) throw new Error('Fehler beim Laden der Sender')
  return res.json()
}

export async function createSender(data: any) {
  const res = await fetch(`${API_BASE}/senders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Erstellen des Senders')
  return res.json()
}

export async function updateSender(id: number, data: any) {
  const res = await fetch(`${API_BASE}/senders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Aktualisieren des Senders')
  return res.json()
}

export async function deleteSender(id: number) {
  const res = await fetch(`${API_BASE}/senders/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Fehler beim Löschen des Senders')
}


export async function testSenderConnection(data: any) {
  const res = await fetch(`${API_BASE}/senders/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Testen der Verbindung')
  return res.json()
}

export async function testWebook(data: any) {
  const res = await fetch(`${API_BASE}/webhooks/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Fehler beim Senden des Webhooks')
  return res.json()
}



export async function fetchMailJobs() {
  const res = await fetch(`${API_BASE}/mailer`)
  if (!res.ok) throw new Error('Fehler beim Laden der Mailer-Jobs')
  return res.json()
}

export async function fetchMailerJob(id: number) {
  const res = await fetch(`${API_BASE}/mailer/${id}`)
  if (!res.ok) throw new Error('Fehler beim Laden des Mailer-Jobs')
  return res.json()
}


export async function updateMailerJob(id: number, data: any) {
  const res = await fetch(`${API_BASE}/mailer/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('Fehler beim Aktualisieren des Mailer-Jobs')
  }

  return res.json()
}

export async function createMailerJob(payload: {
  name: string
  host_id: number
  website_id: string
  sender_id: number | null
  frequency: string
  day?: number | null
  email_recipients?: string[]
  webhook_recipients?: number[],
  is_active: boolean
}) {
  const res = await fetch(`${API_BASE}/mailer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Mailer Job konnte nicht erstellt werden.')
  }

  return res.json()
}

export async function deleteMailerJob(id: number) {
  const res = await fetch(`${API_BASE}/mailer/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Fehler beim Löschen des Jobs: ${error}`)
  }
  return res.json()
}



export async function fetchWebsitesByInstance(instanceId: number) {
  const res = await fetch(`${API_BASE}/umami/${instanceId}/websites`)
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Fehler beim Laden der Websites: ${error}`)
  }
  const json = await res.json()
  return json
}










import { WebhookRecipient, WebhookRecipientCreate, WebhookRecipientUpdate } from '@/types'

export async function fetchWebhookRecipients(): Promise<WebhookRecipient[]> {
  const res = await fetch(`${API_BASE}/webhooks`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Webhook-Empfänger konnten nicht geladen werden.')
  return res.json()
}

export async function fetchWebhookRecipient(id: number): Promise<WebhookRecipient> {
  const res = await fetch(`${API_BASE}/webhooks/${id}`)
  if (!res.ok) throw new Error('Webhook-Empfänger nicht gefunden.')
  return res.json()
}

export async function createWebhookRecipient(
  data: WebhookRecipientCreate
): Promise<WebhookRecipient> {
  const res = await fetch(`${API_BASE}/webhooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Webhook-Empfänger konnte nicht erstellt werden.')
  return res.json()
}

export async function updateWebhookRecipient(
  id: number,
  data: WebhookRecipientUpdate
): Promise<WebhookRecipient> {
  const res = await fetch(`${API_BASE}/webhooks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Webhook-Empfänger konnte nicht aktualisiert werden.')
  return res.json()
}

export async function deleteWebhookRecipient(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/webhooks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Webhook-Empfänger konnte nicht gelöscht werden.')
}







import { Sender } from '@/types'

export async function getSender(id: number): Promise<Sender> {
  const res = await fetch(`${API_BASE}/senders/${id}`)
  if (!res.ok) {
    throw new Error('Sender konnte nicht geladen werden.')
  }
  return res.json()
}





export async function fetchDashboardStats() {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error("Fehler beim Laden der Dashboard-Daten");
  }
  return await response.json();
}

export async function fetchJobChartData() {
  const res = await fetch(`${API_BASE}/stats/log`);
  if (!res.ok) throw new Error('Fehler beim Laden der Chart-Daten');
  return await res.json();
}