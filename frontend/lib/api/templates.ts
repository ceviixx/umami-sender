import { apiFetch } from '@/utils/api'

export const fetchTemplates = () => apiFetch('/templates');
export const fetchTemplate = (type: string) => apiFetch(`/templates/${type}`);
export const fetchTemplatePreview = (type: string) => apiFetch(`/templates/${type}/preview`);
export const updateTemplate = (type: string, data: any) => apiFetch(`/templates/${type}`, { method: 'PUT', body: data });
export const deleteTemplate = (type: string) => apiFetch(`/templates/${type}`, { method: 'DELETE' });
export const updateTemplates = () => apiFetch('/templates/refresh', { method: 'PATCH' })

export const fetchTemplateSource = () => apiFetch('/settings/template-source')
export const updateTemplateSource = (data: TemplateSourceConfig) => apiFetch('/settings/template-source', { method: 'PUT', body: data })
export const deleteTemplateSource = () => apiFetch('/settings/template-source', { method: 'DELETE' })

export type TemplateSourceConfig = {
  repo: string;
  branch: string;
  subdir: string;
};