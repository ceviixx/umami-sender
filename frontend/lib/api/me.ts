import { apiFetch } from '@/utils/api'

export const fetchMe = () => apiFetch('/me');
export const updateMe = (data: any) => apiFetch(`/me`, { method: 'PUT', body: data });
export const updatePassword = (data: any) => apiFetch(`/me/password`, { method: 'PUT', body: data });