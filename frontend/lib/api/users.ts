import { apiFetch } from '@/utils/api'

export const fetchUsers = () => apiFetch('/users');
export const fetchUser = (id: string) => apiFetch(`/users/${id}`);
export const createUser = (data: any) => apiFetch('/users', { method: 'POST', body: data });
export const updateUser = (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PUT', body: data });
export const deleteUser = (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' });