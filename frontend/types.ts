export type UmamiType = 'cloud' | 'self_hosted'

export interface UmamiInstance {
  id: number
  name: string
  type: UmamiType
}


export type Sender = {
  id: number
  name: string
  email: string
  smtp_host: string
  smtp_port: number
  smtp_username: string
  use_tls: boolean
  use_ssl: boolean
}


export interface Website {
  id: string
  name: string
  domain: string
}


export type MailerJob = {
  id: number
  name: string
  sender_id: number | null
  host_id: number
  host_name: string
  website_id: string
  website_name: string
  frequency: 'daily' | 'weekly' | 'monhtly'
  day: string | null
  report_type: string
  is_active: boolean
  webhook_recipients: number[]
}


export type MailerJobUpdate = {
  name: string
  host_id: number
  website_id: string
  frequency: 'daily' | 'weekly' | 'monthly'
  day: number | null
  is_active: boolean
  email_recipients?: string[]
  webhook_recipients?: number[]
}








export interface WebhookRecipient {
  id: number
  name: string
  url: string
  type: 'DISCORD' | 'SLACK' | 'CUSTOM'
}

export interface WebhookRecipientCreate {
  name: string
  url: string
  type: 'DISCORD' | 'SLACK' | 'CUSTOM'
}

export interface WebhookRecipientUpdate {
  name?: string
  url?: string
  type?: 'DISCORD' | 'SLACK' | 'CUSTOM'
}