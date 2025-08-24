import { apiFetch } from '@/utils/api'

export const login = (data: any) => apiFetch('/auth/login', { method: 'POST', body: data });
export const verify = () => apiFetch('/auth/verify', { method: 'GET', cache: "no-store" })
export const verifyMiddle = (cookie: any, authorization: any) => apiFetch('', { method: 'GET', cache: "no-store", headers: {'Cookie': cookie, 'Authorization': authorization} })