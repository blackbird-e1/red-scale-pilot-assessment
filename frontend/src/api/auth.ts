export type UserRole = 'trainer' | 'trainee';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
}

const API_BASE_URL = '/api/v1';

export async function loginWithGoogle(
  credential: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credential,
    }),
  });

  if (!response.ok) {
    let message = `Google login failed (${response.status})`;

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