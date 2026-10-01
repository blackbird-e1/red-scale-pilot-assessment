import { authenticatedFetch } from './client';

export type TrainerRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface AdminTrainerRequest {
  id: string;
  user_id: string;
  status: TrainerRequestStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ApproveTrainerRequestResponse {
  message: string;
  user_id: string;
  role: 'trainer';
  request_id: string;
  status: 'approved';
}

export interface RejectTrainerRequestResponse {
  message: string;
  request_id: string;
  status: 'rejected';
}

export interface DemoteTrainerResponse {
  message: string;
  user_id: string;
  role: 'trainee';
}

export async function getTrainerRequests(): Promise<
  AdminTrainerRequest[]
> {
  const response = await authenticatedFetch('/admin/trainer-requests');

  if (!response.ok) {
    let message = `Unable to load trainer requests (${response.status})`;

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

  return response.json() as Promise<AdminTrainerRequest[]>;
}

export async function approveTrainerRequest(
  requestId: string,
): Promise<ApproveTrainerRequestResponse> {
  const response = await authenticatedFetch(
    `/admin/trainer-requests/${requestId}/approve`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    let message = `Unable to approve trainer request (${response.status})`;

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

  return response.json() as Promise<ApproveTrainerRequestResponse>;
}

export async function rejectTrainerRequest(
  requestId: string,
): Promise<RejectTrainerRequestResponse> {
  const response = await authenticatedFetch(
    `/admin/trainer-requests/${requestId}/reject`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    let message = `Unable to reject trainer request (${response.status})`;

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

  return response.json() as Promise<RejectTrainerRequestResponse>;
}

export async function demoteTrainer(
  userId: string,
): Promise<DemoteTrainerResponse> {
  const response = await authenticatedFetch(
    `/admin/users/${userId}/demote`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    let message = `Unable to demote trainer (${response.status})`;

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

  return response.json() as Promise<DemoteTrainerResponse>;
}

export interface AdminTrainer {
  id: string;
  name: string;
  email: string;
  role: 'trainer';
}

export async function getTrainers(): Promise<AdminTrainer[]> {
  const response = await authenticatedFetch('/admin/trainers');

  if (!response.ok) {
    let message = `Unable to load trainers (${response.status})`;

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

  return response.json() as Promise<AdminTrainer[]>;
}