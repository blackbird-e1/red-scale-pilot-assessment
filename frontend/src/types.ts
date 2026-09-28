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
  benchmark: BenchmarkAssessment;
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

export interface BenchmarkEvidence {
  metric: string;
  value: number;
  timestamp_sec?: number | null;
  duration_sec?: number | null;
}

export type BenchmarkBehaviourStatus =
  | 'observed'
  | 'attention'
  | 'deviation';

export type BenchmarkBehaviourSeverity =
  | 'low'
  | 'medium'
  | 'high';

export interface BenchmarkFinding {
  behaviour_id: string;
  behaviour_name: string;
  status: BenchmarkBehaviourStatus;
  severity: BenchmarkBehaviourSeverity;
  evidence: BenchmarkEvidence[];
  explanation: string;
}

export interface BenchmarkAssessment {
  benchmark_id: string;
  benchmark_version: string;
  competencies: BenchmarkCompetency[];
}

export interface BenchmarkCompetency {
  competency_id: string;
  competency_name: string;
  findings: BenchmarkFinding[];
}

export type Role = 'user' | 'assistant';

export interface StreamChunk {
  type: 'delta' | 'tool_call' | 'done' | 'error';
  content: string;
  tool_name?: string | null;
  conversation_id?: string | null;
}

export interface AssessmentHistoryItem {
  id: string;
  created_at: string;

  source_filename: string;

  benchmark_id: string;
  benchmark_version: string;

  risk_score: number;
  overall_rating: OverallRating;

  duration_sec: number;
  max_speed_knots: number;
  max_bank_angle_deg: number;
  max_descent_rate_fpm: number;
}

export interface AssessmentDetail {
  id: string;
  pilot_id: string;
  created_by: string;
  created_at: string;
  source_filename: string;
  benchmark_id: string;
  benchmark_version: string;
  features: FlightFeatures;
  benchmark: BenchmarkAssessment;
  risk_score: number;
  overall_rating: OverallRating;
  violations: RuleViolation[];
  visual_observations: VisualObservation[];
  telemetry: TelemetryPoint[];
}

export interface RecurringViolation {
  rule_id: string;
  rule_name: string;
  occurrences: number;
  total_assessments: number;
  severity: ViolationSeverity;
  percentage: number;
}

export interface PilotDNA {
  pilot_id: string;
  assessment_count: number;
  latest_risk: number | null;
  average_risk: number | null;
  risk_trend: string;
  strengths: string[];
  weaknesses: string[];
  recurring_violations: RecurringViolation[];
  latest_assessment_date: string | null;
  risk_history: number[];
}

export interface TornadoExampleFlight {
  id: string;
  name: string;
  description: string;
}

export interface TornadoMetricSet {
  trajectory_deviation: {
    mean_error_m: number;
    rmse_m: number;
    max_error_m: number;
    max_error_timestamp_sec: number;
  };

  position_stability: {
    std_x_m: number;
    std_y_m: number;
    std_z_m: number;
    overall_std_m: number;
  };

  velocity_stability: {
    std_x_ms: number;
    std_y_ms: number;
    std_z_ms: number;
    overall_std_ms: number;
    mean_speed_ms: number;
    max_speed_ms: number;
  };

  attitude_stability: {
    roll_std_deg: number;
    pitch_std_deg: number;
    yaw_std_deg: number;
    overall_std_deg: number;
  };

  control_smoothness: {
    mean_roll_change: number;
    mean_pitch_change: number;
    mean_thrust_change: number;
    mean_yaw_change: number;
    overall_mean_change: number;
    max_control_change: number;
  };
}

export interface TornadoEvidence {
  metric: string;
  value: number;
  unit: string;
  timestamp_sec: number | null;
  description: string;
}

export interface TornadoEvent {
  timestamp_sec: number;
  type: string;
  severity: string;
  description: string;
  evidence: TornadoEvidence[];
}

export interface TornadoAssessmentResult {
  flight_id: string;
  duration_sec: number;
  metrics: TornadoMetricSet;
  events: TornadoEvent[];
}