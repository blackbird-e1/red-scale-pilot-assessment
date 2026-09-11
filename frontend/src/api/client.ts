const API_BASE_URL = '/api/v1';

export const AUTH_EVENTS = {
  unauthorized: 'red-scale:unauthorized',
} as const;

function getAccessToken(): string | null {
  const stored = localStorage.getItem('red-scale-auth');

  if (!stored) {
    return null;
  }

  try {
    const auth = JSON.parse(stored) as {
      access_token?: string;
    };

    return auth.access_token || null;
  } catch {
    return null;
  }
}

function notifyUnauthorized(): void {
  window.dispatchEvent(new Event(AUTH_EVENTS.unauthorized));
}

export async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    notifyUnauthorized();
  }

  return response;
}