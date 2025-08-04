import { apiFetch } from '@/utils/api'

export const fetchMailers = () => apiFetch('/mailer');
export const fetchMailer = (id: number) => apiFetch(`/mailer/${id}`);
export const createMailer = (data: any) => apiFetch('/mailer', { method: 'POST', body: data });
export const updateMailer = (id: number, data: any) => apiFetch(`/mailer/${id}`, { method: 'PUT', body: data });
export const deleteMailer = (id: number) => apiFetch(`/mailer/${id}`, { method: 'DELETE' });
export const testConnection = (data: any) => apiFetch('/mailer/test', { method: 'POST', body: data });