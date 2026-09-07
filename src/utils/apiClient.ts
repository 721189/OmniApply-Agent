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

