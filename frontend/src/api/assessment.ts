import type { Assessment } from '../types';
import { authenticatedFetch } from './client';

export async function assessFlight(
  file: File,
  image?: File,
): Promise<Assessment> {
  const formData = new FormData();
  formData.append('file', file);

  if (image) {
    formData.append('image', image);
  }

  const response = await authenticatedFetch('/assessment', {
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