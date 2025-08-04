import { apiFetch } from '@/utils/api'

export const fetchUmamis = () => apiFetch('/umami');
export const fetchUmami = (id: number) => apiFetch(`/umami/${id}`);
export const createUmami = (data: any) => apiFetch('/umami', { method: 'POST', body: data });
export const updateUmami = (id: number, data: any) => apiFetch(`/umami/${id}`, { method: 'PUT', body: data });
export const deleteUmami = (id: number) => apiFetch(`/umami/${id}`, { method: 'DELETE' });
export const fetchWebsitesByUmami = (id: number) => apiFetch(`/umami/${id}/websites`);
export const fetchReportsByWebsite = (id: number, website: string) => apiFetch(`/umami/${id}/reports?website_id=${website}`)