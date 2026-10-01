import { authenticatedFetch } from './client';

export type TrainerRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TrainerRequest {
  id: string;
  status: TrainerRequestStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface MyTrainerRequestResponse {
  has_request: boolean;
  request: TrainerRequest | null;
}

export async function createTrainerRequest(): Promise<TrainerRequest> {
  const response = await authenticatedFetch('/trainer-requests', {
    method: 'POST',
  });

  if (!response.ok) {
    let message = `Unable to request trainer access (${response.status})`;

    try {
      const data = await response.json();

      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<TrainerRequest>;
}

export async function getMyTrainerRequest(): Promise<MyTrainerRequestResponse> {
  const response = await authenticatedFetch('/trainer-requests/me');

  if (!response.ok) {
    let message = `Unable to load trainer access status (${response.status})`;

    try {
      const data = await response.json();

      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<MyTrainerRequestResponse>;
}