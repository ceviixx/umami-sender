import { apiFetch } from '@/utils/api'

export const fetchBranding = () => apiFetch('/settings/logo/branding', { cache: 'no-cache'});
export const fetchLogo = () => apiFetch('/settings/logo');
export const uploadLogo = (data: FormData) => apiFetch(`/settings/logo`, { method: 'POST', body: data });
export const deleteLogo = () => apiFetch(`/settings/logo`, { method: 'DELETE' });