export type UserRole = 'trainer' | 'trainee';

export interface LoginResponse {
  authenticated: boolean;
  username: string;
  role: UserRole;
}

const API_BASE_URL = '/api/v1';

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    let message = `Login failed (${response.status})`;

    try {
      const data = await response.json();

      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<LoginResponse>;
}