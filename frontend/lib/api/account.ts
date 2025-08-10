import { apiFetch } from '@/utils/api'

export const login = (data: any) => apiFetch('/auth/login', { method: 'POST', body: data });