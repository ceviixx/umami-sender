import { apiFetch } from '@/utils/api'

export const fetchStats = () => apiFetch('/stats');
export const fetchStatsLogs = () => apiFetch('/stats/log');