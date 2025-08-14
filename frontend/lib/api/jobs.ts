import { apiFetch } from '@/utils/api'

export const fetchJobs = () => apiFetch('/job');
export const fetchJob = (id: string) => apiFetch(`/job/${id}`);
export const createJob = (data: any) => apiFetch('/job', { method: 'POST', body: data });
export const updateJob = (id: string, data: any) => apiFetch(`/job/${id}`, { method: 'PUT', body: data });
export const deleteJob = (id: string) => apiFetch(`/job/${id}`, { method: 'DELETE' });
export const updateJobStatus = (id: string, isActive: boolean) => apiFetch(`/job/${id}/status`, { method: 'PUT' });