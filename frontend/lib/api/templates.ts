import { apiFetch } from '@/utils/api'

export const fetchTemplates = () => apiFetch('/templates');
export const fetchTemplate = (type: string) => apiFetch(`/templates/${type}`);
export const fetchTemplatePreview = (type: string) => apiFetch(`/templates/${type}/preview`);
export const updateTemplate = (type: string, data: any) => apiFetch(`/templates/${type}`, { method: 'PUT', body: data });
export const deleteTemplate = (type: string) => apiFetch(`/templates/${type}`, { method: 'DELETE' });