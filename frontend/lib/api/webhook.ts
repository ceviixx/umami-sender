import { apiFetch } from '@/utils/api'

export const fetchWebhooks = () => apiFetch('/webhooks');
export const fetchWebhook = (id: number) => apiFetch(`/webhooks/${id}`);
export const createWebhook = (data: any) => apiFetch('/webhooks', { method: 'POST', body: data });
export const updateWebhook = (id: number, data: any) => apiFetch(`/webhooks/${id}`, { method: 'PUT', body: data });
export const deleteWebhook = (id: number) => apiFetch(`/webhooks/${id}`, { method: 'DELETE' });
export const testWebhook = (data: any) => apiFetch('/webhooks/test', { method: 'POST', body: data });