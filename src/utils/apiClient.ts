/**
 * OmniApply API Client Utility
 *
 * Uses authoritative HttpOnly session cookies for browser authentication.
 * All requests automatically include same-origin credentials.
 */

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      ...init?.headers,
    },
  });
}

export interface ParsedApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Safely parse JSON from a fetch Response, handling HTML/text error pages or non-JSON responses gracefully
 * so `Unexpected token 'A', "A server e"... is not valid JSON` syntax errors are completely prevented.
 */
export async function safeJson<T = any>(res: Response): Promise<ParsedApiResponse<T>> {
  const contentType = res.headers.get('content-type') || '';
  let text = '';
  try {
    text = await res.text();
  } catch (err: any) {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: 'Failed to read server response',
    };
  }

  if (!text || !text.trim()) {
    return {
      ok: res.ok,
      status: res.status,
      data: null,
      error: res.ok ? undefined : `Server returned error (${res.status})`,
    };
  }

  // Attempt JSON parse
  try {
    const data = JSON.parse(text);
    const errorMsg = !res.ok ? (data?.error || data?.message || `Request failed with status ${res.status}`) : undefined;
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: errorMsg,
    };
  } catch {
    // If response was not JSON (e.g. 500 HTML/text from proxy or server error)
    const stripped = text.replace(/<[^>]*>?/gm, '').trim();
    const cleanMsg = stripped.length > 150 ? stripped.slice(0, 150) + '...' : stripped;
    return {
      ok: res.ok,
      status: res.status,
      data: null,
      error: !res.ok ? (cleanMsg || `Server error (${res.status})`) : undefined,
    };
  }
}
