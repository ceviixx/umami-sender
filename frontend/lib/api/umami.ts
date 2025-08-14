import { apiFetch } from '@/utils/api'

export const fetchUmamis = () => apiFetch('/umami');
export const fetchUmami = (id: string) => apiFetch(`/umami/${id}`);
export const createUmami = (data: any) => apiFetch('/umami', { method: 'POST', body: data });
export const updateUmami = (id: string, data: any) => apiFetch(`/umami/${id}`, { method: 'PUT', body: data });
export const deleteUmami = (id: string) => apiFetch(`/umami/${id}`, { method: 'DELETE' });
export const fetchWebsitesByUmami = (id: string) => apiFetch(`/umami/${id}/websites`);
export const fetchReportsByWebsite = (id: string, website: string) => apiFetch(`/umami/${id}/reports?website_id=${website}`)