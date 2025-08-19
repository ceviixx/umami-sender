const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestOptions & { timeout?: number } = {}
): Promise<T> {
  await refreshAccessTokenIfNeeded();

  const { method = 'GET', body, headers = {}, cache, timeout = 10000 } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
      signal: controller.signal,
    });

    clearTimeout(id);

    const contentType = res.headers.get('Content-Type') || '';

    if (!res.ok) {
      let errorMessage = `Request failed: ${method} ${path}`;
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus = res.status;

      if (contentType.includes('application/json')) {
        try {
          const data = await res.json();
          errorMessage = data?.error?.code || data?.code || errorMessage;
          errorCode = data?.error?.code || errorCode;
          errorStatus = data?.error?.status || errorStatus;

          const error = new Error(errorMessage);
          (error as any).code = errorCode;
          (error as any).status = errorStatus;
          throw error;
        } catch (jsonErr) {
          throw new Error(errorMessage);
        }
      } else {
        const text = await res.text();
        throw new Error(text || errorMessage);
      }
    }

    if (res.status === 204) return {} as T;

    if (contentType.includes('application/json')) {
      return res.json();
    } else {
      const text = await res.text();
      return text as unknown as T;
    }
  } catch (err: any) {
    clearTimeout(id)

    if (err?.name === 'AbortError') {
      const error = new Error(
        `Request timed out after ${timeout}ms: ${method} ${path}`,
        { cause: err as Error }
      );
      (error as any).code = 'TIMEOUT';
      error.name = 'TimeoutError';
      throw error;
    }

    if (err instanceof TypeError) {
      const error = new Error(
        `Network error or API unreachable: ${method} ${path}`,
        { cause: err as Error }
      );
      (error as any).code = 'NETWORK_ERROR';
      error.name = 'NetworkError';
      throw error;
    }

    throw err
  }
}


async function refreshAccessTokenIfNeeded() {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    const exp = decoded.exp * 1000
    const now = Date.now()

    if (exp < now) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error("Session expired")

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      })

      if (!res.ok) throw new Error("Refresh failed")
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
    }
  } catch (err) {
    console.warn('Token refresh failed, logging out…', err)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }
}
