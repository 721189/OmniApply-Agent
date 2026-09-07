export function getAuthToken(): string | null {
  return localStorage.getItem('omniapply_token');
}

export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders((init?.headers as Record<string, string>) || {});
  return fetch(input, {
    ...init,
    headers,
  });
}
