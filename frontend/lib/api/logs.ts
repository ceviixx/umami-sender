import { apiFetch } from '@/utils/api'

export const fetchLogs = () => apiFetch('/logs');
export const fetchJobLogs = (id: string) => apiFetch(`/logs/${id}`);