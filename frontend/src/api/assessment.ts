import type {
  Assessment,
  AssessmentDetail,
  AssessmentHistoryItem,
} from '../types';
import { authenticatedFetch } from './client';

export async function assessFlight(
  file: File,
  pilotId: string,
  image?: File,
): Promise<Assessment> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('pilot_id', pilotId);

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


export async function getPilotAssessmentHistory(
  pilotId: string,
): Promise<AssessmentHistoryItem[]> {
  const response = await authenticatedFetch(
    `/assessment/pilot/${pilotId}`,
  );

  if (!response.ok) {
    let message = `Unable to load assessment history (${response.status})`;

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

  return response.json() as Promise<AssessmentHistoryItem[]>;
}


export async function getAssessment(
  assessmentId: string,
): Promise<AssessmentDetail> {
  const response = await authenticatedFetch(
    `/assessment/${assessmentId}`,
  );

  if (!response.ok) {
    let message = `Unable to load assessment (${response.status})`;

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

  return response.json() as Promise<AssessmentDetail>;
}

export interface Trainee {
  id: string;
  name: string;
  email: string;
}

export async function getTrainees(): Promise<Trainee[]> {
  const response = await authenticatedFetch('/auth/trainees');

  if (!response.ok) {
    let message = `Unable to load trainees (${response.status})`;

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

  return response.json() as Promise<Trainee[]>;
}