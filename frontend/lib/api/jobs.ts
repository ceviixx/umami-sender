import { apiFetch } from '@/utils/api'

export const fetchJobs = () => apiFetch('/job');
export const fetchJob = (id: number) => apiFetch(`/job/${id}`);
export const createJob = (data: any) => apiFetch('/job', { method: 'POST', body: data });
export const updateJob = (id: number, data: any) => apiFetch(`/job/${id}`, { method: 'PUT', body: data });
export const deleteJob = (id: number) => apiFetch(`/job/${id}`, { method: 'DELETE' });