import { authenticatedFetch } from './client';

export interface ReplayTelemetryPoint {
  timestamp_sec: number;

  altitude_ft: number;
  indicated_airspeed_knots: number;

  pitch_deg: number;
  roll_deg: number;

  vertical_speed_fpm: number;
  bank_angle_deg: number;

  throttle_percent: number;
}

export interface ReplayEvidence {
  metric: string;
  value: number;
  timestamp_sec?: number | null;
  duration_sec?: number | null;
}

export interface ReplayEvent {
  timestamp_sec: number;
  type: string;
  label: string;
  severity?: string | null;

  competency_id?: string | null;
  competency_name?: string | null;

  behaviour_id?: string | null;
  behaviour_name?: string | null;

  evidence?: ReplayEvidence | null;
}

export interface ReplayDataset {
  assessment_id: string;
  pilot_id: string;
  source_filename: string | null;

  duration_sec: number;

  telemetry: ReplayTelemetryPoint[];
  events: ReplayEvent[];
}

export async function getReplay(
  assessmentId: string,
): Promise<ReplayDataset> {
  const response = await authenticatedFetch(
    `/replay/${assessmentId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load flight replay (${response.status})`,
    );
  }

  return response.json() as Promise<ReplayDataset>;
}