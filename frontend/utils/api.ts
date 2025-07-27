const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

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
  const { method = 'GET', body, headers = {}, cache, timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Error on request: ${method} ${path}`);
    }

    if (res.status === 204) return {} as T;

    return res.json();
  } catch (err: any) {
    clearTimeout(id);

    if (err.name === 'AbortError') {
      throw new Error(`Timeout nach ${timeout}ms for request: ${method} ${path}`);
    }

    throw err;
  }
}
