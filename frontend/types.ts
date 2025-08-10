export type UmamiType = 'cloud' | 'self_hosted'

export interface UmamiInstance {
  id: string
  name: string
  type: UmamiType
}

export interface Template {
  id: string
  type: string
  sender_type: string
  description: string
  content: string
}

export type Sender = {
  id: string
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

export type LogItem = {
  id: string
  name: string
  timestamp: string
  status: string
  error?: string
  channel: string
}

export type MailerJob = {
  id: string
  name: string
  mailer_id: string | null
  umami_id: string
  host_name: string
  website_id: string
  website_name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  day: string | null
  execution_time: string
  report_type: string
  is_active: boolean
  webhook_recipients: number[]
}


export type MailerJobUpdate = {
  name: string
  umami_id: string
  website_id: string
  mailer_id: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  day: number | null
  execution_time: string
  is_active: boolean
  email_recipients?: string[]
  webhook_recipients?: number[]
}






export interface User {
  id: string
  username: string
  role: 'admin' | 'user'
  language: string
}

export interface WebhookRecipient {
  id: string
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