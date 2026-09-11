export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type OverallRating =
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Unsafe';

export interface FlightFeatures {
  duration_sec: number;

  max_altitude_ft: number;
  min_altitude_ft: number;

  max_speed_knots: number;
  avg_speed_knots: number;

  max_pitch_deg: number;
  min_pitch_deg: number;

  max_roll_deg: number;
  min_roll_deg: number;

  max_bank_angle_deg: number;

  max_climb_rate_fpm: number;
  max_descent_rate_fpm: number;

  avg_throttle_percent: number;
}

export interface RuleViolation {
  rule_id: string;
  rule_name: string;
  severity: ViolationSeverity;
  message: string;
  expected: string;
  actual: string;

  benchmark_score: number;
  status: string;
  deviation: number;
}

export interface TelemetryPoint {
  timestamp_sec: number;

  altitude_ft: number;
  indicated_airspeed_knots: number;

  pitch_deg: number;
  roll_deg: number;

  vertical_speed_fpm: number;
  bank_angle_deg: number;

  throttle_percent: number;
}

export interface Assessment {
  features: FlightFeatures;

  benchmark_results: BenchmarkResult[];

  violations: RuleViolation[];

  visual_observations: VisualObservation[];

  risk_score: number;

  overall_rating: OverallRating;

  telemetry: TelemetryPoint[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;

  timestamp?: Date;

  streaming?: boolean;
  error?: boolean;

  toolCalls?: string[];
}

export interface DebriefResponse {
  summary: string;
  key_findings: string[];
  areas_of_concern: string[];
  recommendations: string[];
}

export interface VisualObservation {
  category: string;
  finding: string;
  confidence: number;
  source: string;
}

export interface BenchmarkResult {
  rule_id: string;
  rule_name: string;
  severity: ViolationSeverity;
  message: string;
  expected: string;
  actual: string;
  benchmark_score: number;
  status: string;
  deviation: number;
}

export type Role = 'user' | 'assistant';

export interface StreamChunk {
  type: 'delta' | 'tool_call' | 'done' | 'error';
  content: string;
  tool_name?: string | null;
  conversation_id?: string | null;
}