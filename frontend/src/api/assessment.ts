import type { Assessment } from '../types';

const API_BASE_URL = '/api/v1';

export async function assessFlight(file: File, image?: File,): Promise<Assessment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/assessment`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = `Assessment failed (${response.status})`;

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

  return response.json() as Promise<Assessment>;
}