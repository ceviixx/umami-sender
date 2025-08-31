const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'auto';

interface RequestOptions {
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  timeout?: number;
  responseType?: ResponseType; // 👈 NEU
}

function isFormData(v: any): v is FormData {
  return typeof FormData !== 'undefined' && v instanceof FormData;
}
function isBlob(v: any): v is Blob {
  return typeof Blob !== 'undefined' && v instanceof Blob;
}
function isArrayBufferView(v: any): v is ArrayBufferView {
  return v && v.buffer instanceof ArrayBuffer;
}
function isPlainObject(v: any) {
  return v && typeof v === 'object' && !isFormData(v) && !isBlob(v) && !isArrayBufferView(v);
}

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  await refreshAccessTokenIfNeeded();

  const {
    method = 'GET',
    body,
    headers = {},
    cache,
    timeout = 10000,
    responseType = 'auto',
  } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Body & Headers vorbereiten
  let finalBody: BodyInit | undefined;
  const finalHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers, // User-Header haben Vorrang (z. B. eigener Content-Type)
  };

  if (body !== undefined && body !== null) {
    if (isFormData(body)) {
      finalBody = body; // KEIN Content-Type setzen – Browser setzt Boundary selbst
      if ('Content-Type' in finalHeaders) delete finalHeaders['Content-Type'];
    } else if (isBlob(body) || isArrayBufferView(body)) {
      finalBody = body as any; // Content-Type ggf. vom Blob übernehmen
      // finalHeaders['Content-Type'] optional setzen, falls zwingend nötig
    } else if (isPlainObject(body)) {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
      finalBody = JSON.stringify(body);
    } else if (typeof body === 'string') {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'text/plain;charset=UTF-8';
      finalBody = body;
    } else {
      // Fallback (z. B. URLSearchParams)
      finalBody = body as any;
    }
  } else {
    // Ohne Body keinen JSON-Content-Type erzwingen
    if (finalHeaders['Content-Type'] === 'application/json') delete finalHeaders['Content-Type'];
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
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
          errorMessage = data?.message || data?.error?.message || data?.code || errorMessage;
          errorCode = data?.error?.code || data?.code || errorCode;
          errorStatus = data?.error?.status || errorStatus;

          const error = new Error(errorMessage);
          (error as any).code = errorCode;
          (error as any).status = errorStatus;
          throw error;
        } catch {
          throw new Error(errorMessage);
        }
      } else {
        const text = await res.text();
        throw new Error(text || errorMessage);
      }
    }

    if (res.status === 204) return {} as T;

    // Antwort dekodieren (mit responseType-Unterstützung)
    const rt: ResponseType =
      responseType === 'auto'
        ? contentType.includes('application/json')
          ? 'json'
          : contentType.startsWith('text/')
          ? 'text'
          : 'blob' // auto: alles andere (image/*, pdf, zip, …) als Blob
        : responseType;

    switch (rt) {
      case 'json':
        return (await res.json()) as T;
      case 'text':
        return (await res.text()) as unknown as T;
      case 'arrayBuffer':
        return (await res.arrayBuffer()) as unknown as T;
      case 'blob':
        return (await res.blob()) as unknown as T;
      default:
        return (await res.text()) as unknown as T;
    }
  } catch (err: any) {
    clearTimeout(id);

    if (err?.name === 'AbortError') {
      const error = new Error(`Request timed out after ${timeout}ms: ${method} ${path}`, { cause: err as Error });
      (error as any).code = 'TIMEOUT';
      error.name = 'TimeoutError';
      throw error;
    }

    if (err instanceof TypeError) {
      const error = new Error(`Network error or API unreachable: ${method} ${path}`, { cause: err as Error });
      (error as any).code = 'NETWORK_ERROR';
      error.name = 'NetworkError';
      throw error;
    }

    throw err;
  }
}

async function refreshAccessTokenIfNeeded() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return;

  try {
    const payload = token.split('.')[1] || '';
    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp * 1000;
    const now = Date.now();

    if (exp < now) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('Session expired');

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
    }
  } catch (err) {
    console.warn('Token refresh failed, logging out…', err);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
}
