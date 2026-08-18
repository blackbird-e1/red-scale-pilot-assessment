import { useEffect, useState } from 'react';
import FlightCharts from './FlightCharts';
import type { Assessment,   DebriefResponse, RuleViolation } from '../types';

interface AssessmentResultsProps {
  assessment: Assessment;
  fileName: string;
}

function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function ratingClass(rating: Assessment['overall_rating']): string {
  switch (rating) {
    case 'Excellent':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

    case 'Good':
      return 'border-green-500/30 bg-green-500/10 text-green-300';

    case 'Fair':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';

    case 'Poor':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-300';

    case 'Unsafe':
      return 'border-red-500/30 bg-red-500/10 text-red-300';

    default:
      return 'border-[#303030] bg-[#171717] text-gray-300';
  }
}

function severityClass(severity: RuleViolation['severity']): string {
  switch (severity) {
    case 'low':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-300';

    case 'medium':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';

    case 'high':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-300';

    case 'critical':
      return 'border-red-500/30 bg-red-500/10 text-red-300';

    default:
      return 'border-[#303030] text-gray-400';
  }
}

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-[#292929] bg-[#151515] p-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-white">{value}</span>

        {unit && (
          <span className="text-[10px] text-gray-600">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusStep({
  label,
  last = false,
}: {
  label: string;
  last?: boolean;
}) {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-400">
          ✓
        </span>

        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </span>
      </div>

      {!last && (
        <div className="mx-3 h-px w-5 bg-[#303030] sm:w-8" />
      )}
    </div>
  );
}

export default function AssessmentResults({
  assessment,
  fileName,
}: AssessmentResultsProps) {
  const [debrief, setDebrief] = useState<DebriefResponse | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(true);
  const [debriefError, setDebriefError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function generateDebrief() {
        setDebriefLoading(true);
        setDebriefError(null);

        try {
            const response = await fetch(
            'http://127.0.0.1:8000/api/v1/debrief',
            {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                },
                body: JSON.stringify(assessment),
            },
            );

            if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Debrief request failed (${response.status}): ${errorText}`,
            );
            }

            const data: DebriefResponse = await response.json();

            if (!cancelled) {
            setDebrief(data);
            }
        } catch (error) {
            if (!cancelled) {
            setDebriefError(
                error instanceof Error
                ? error.message
                : 'Unable to generate AI debrief.',
            );
            }
        } finally {
            if (!cancelled) {
            setDebriefLoading(false);
            }
        }
        }

        generateDebrief();

        return () => {
        cancelled = true;
        };
    }, [assessment]);
  const {
    features,
    violations,
    risk_score,
    overall_rating,
    telemetry,
  } = assessment;

  const riskPercentage = Math.max(
    0,
    Math.min(100, risk_score),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">

      {/* Header */}
      <section className="rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8">
        <div className="flex flex-col gap-6">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Assessment Complete
              </p>
            </div>

            <h1 className="mt-3 break-all text-2xl font-semibold text-white sm:text-3xl">
              {fileName}
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Deterministic flight-performance and operational assessment
            </p>
          </div>

          <div className="flex flex-wrap items-center">
            <StatusStep label="Data Parsed" />
            <StatusStep label="Features" />
            <StatusStep label="Rules" />
            <StatusStep label="Risk" />
            <StatusStep label="Assessment" last />
          </div>

        </div>
      </section>

      {/* Overall assessment */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">

        <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8">

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600">
            Overall Assessment
          </p>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex flex-wrap items-center gap-4">

              <span
                className={`rounded-xl border px-5 py-2.5 text-xl font-semibold ${ratingClass(
                  overall_rating,
                )}`}
              >
                {overall_rating}
              </span>

              <div>
                <p className="text-sm text-gray-300">
                  {violations.length === 0
                    ? 'No rule violations detected'
                    : `${violations.length} rule violation${
                        violations.length === 1 ? '' : 's'
                      } detected`}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Based on deterministic assessment rules
                </p>
              </div>

            </div>

            <div className="min-w-[180px]">

              <div className="mb-2 flex justify-between">
                <span className="text-[9px] uppercase tracking-[0.18em] text-gray-600">
                  Risk Level
                </span>

                <span className="text-xs font-semibold text-white">
                  {formatNumber(risk_score)}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#292929]">
                <div
                  className="h-full rounded-full bg-[#e10600]"
                  style={{
                    width: `${riskPercentage}%`,
                  }}
                />
              </div>

            </div>

          </div>
        </div>

        <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8">

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600">
            Risk Score
          </p>

          <div className="mt-2 flex items-baseline gap-2">

            <span className="text-5xl font-bold tracking-tight text-white">
              {formatNumber(risk_score)}
            </span>

            <span className="text-sm text-gray-600">
              / 100
            </span>

          </div>

          <p className="mt-3 text-xs leading-5 text-gray-600">
            Lower scores indicate lower observed operational risk
            under the current assessment model.
          </p>

        </div>

      </section>

      {/* Flight metrics */}
      <section className="mt-6">

        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
            Flight Metrics
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Extracted flight characteristics
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Derived from the uploaded flight data recorder log.
          </p>
        </div>

        <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <MetricCard
              label="Duration"
              value={formatDuration(features.duration_sec)}
            />

            <MetricCard
              label="Max Altitude"
              value={formatNumber(features.max_altitude_ft, 0)}
              unit="ft"
            />

            <MetricCard
              label="Min Altitude"
              value={formatNumber(features.min_altitude_ft, 0)}
              unit="ft"
            />

            <MetricCard
              label="Max Speed"
              value={formatNumber(features.max_speed_knots)}
              unit="kt"
            />

            <MetricCard
              label="Average Speed"
              value={formatNumber(features.avg_speed_knots)}
              unit="kt"
            />

            <MetricCard
              label="Max Pitch"
              value={formatNumber(features.max_pitch_deg)}
              unit="°"
            />

            <MetricCard
              label="Min Pitch"
              value={formatNumber(features.min_pitch_deg)}
              unit="°"
            />

            <MetricCard
              label="Max Roll"
              value={formatNumber(features.max_roll_deg)}
              unit="°"
            />

            <MetricCard
              label="Min Roll"
              value={formatNumber(features.min_roll_deg)}
              unit="°"
            />

            <MetricCard
              label="Max Bank"
              value={formatNumber(features.max_bank_angle_deg)}
              unit="°"
            />

            <MetricCard
              label="Max Climb"
              value={formatNumber(features.max_climb_rate_fpm, 0)}
              unit="fpm"
            />

            <MetricCard
              label="Max Descent"
              value={formatNumber(features.max_descent_rate_fpm, 0)}
              unit="fpm"
            />

            <MetricCard
              label="Average Throttle"
              value={formatNumber(features.avg_throttle_percent)}
              unit="%"
            />

          </div>
        </div>

      </section>

      {/* Charts */}
      <FlightCharts telemetry={telemetry} />

      {/* Rule violations */}
      <section className="mt-6">

        <div className="mb-5">

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
            Compliance Analysis
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Rule evaluation
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Operational rules evaluated by the deterministic assessment engine.
          </p>

        </div>

        {violations.length === 0 ? (

          <div className="rounded-3xl border border-emerald-500/20 bg-[#101614] p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                ✓
              </div>

              <div>
                <p className="text-base font-semibold text-emerald-300">
                  No violations detected
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  The flight passed all currently configured assessment rules.
                </p>
              </div>

              <div className="sm:ml-auto">
                <span className="rounded-full border border-emerald-500/20 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                  Compliant
                </span>
              </div>

            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {violations.map((violation) => (
              <div
                key={`${violation.rule_id}-${violation.rule_name}`}
                className="rounded-2xl border border-[#292929] bg-[#111111] p-5"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="font-semibold text-white">
                        {violation.rule_name}
                      </span>

                      <span className="font-mono text-[10px] text-gray-700">
                        {violation.rule_id}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {violation.message}
                    </p>

                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${severityClass(
                      violation.severity,
                    )}`}
                  >
                    {violation.severity}
                  </span>

                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl bg-[#171717] p-4">

                    <p className="text-[9px] uppercase tracking-[0.18em] text-gray-700">
                      Expected
                    </p>

                    <p className="mt-2 text-sm text-gray-300">
                      {violation.expected}
                    </p>

                  </div>

                  <div className="rounded-xl bg-[#171717] p-4">

                    <p className="text-[9px] uppercase tracking-[0.18em] text-gray-700">
                      Actual
                    </p>

                    <p className="mt-2 text-sm text-gray-300">
                      {violation.actual}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        )}

      </section>


            {/* AI debrief */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-[#e10600]/25 bg-[#151010] p-6 sm:p-8">
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-[#e10600]">✦</span>

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
              AI Mission Intelligence
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Mission Debrief
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                AI-generated interpretation of the deterministic flight
                assessment. Risk score and overall rating remain determined
                by the assessment engine.
              </p>
            </div>

            {debriefLoading && (
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-red-400">
                Generating...
              </span>
            )}

            {!debriefLoading && debrief && (
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                Analysis Complete
              </span>
            )}
          </div>

          {debriefLoading && (
            <div className="mt-7 grid gap-4">
              <div className="animate-pulse rounded-2xl border border-[#2a2020] bg-[#171111] p-5">
                <div className="h-2 w-28 rounded bg-[#292020]" />
                <div className="mt-4 h-3 w-full rounded bg-[#211a1a]" />
                <div className="mt-2 h-3 w-5/6 rounded bg-[#211a1a]" />
                <div className="mt-2 h-3 w-2/3 rounded bg-[#211a1a]" />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="h-32 animate-pulse rounded-2xl border border-[#2a2020] bg-[#171111]" />
                <div className="h-32 animate-pulse rounded-2xl border border-[#2a2020] bg-[#171111]" />
                <div className="h-32 animate-pulse rounded-2xl border border-[#2a2020] bg-[#171111]" />
              </div>
            </div>
          )}

          {!debriefLoading && debriefError && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-300">
                AI debrief unavailable
              </p>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                The deterministic assessment is still valid. The AI layer
                could not generate its interpretation.
              </p>

              <p className="mt-3 font-mono text-[10px] leading-5 text-red-400/70">
                {debriefError}
              </p>
            </div>
          )}

          {!debriefLoading && !debriefError && debrief && (
            <div className="mt-7 space-y-4">
              {/* Summary */}
              <div className="rounded-2xl border border-[#2a2020] bg-[#171111] p-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Flight Summary
                </p>

                <p className="mt-3 text-sm leading-7 text-gray-300">
                  {debrief.summary}
                </p>
              </div>

              {/* Findings / Concerns / Recommendations */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#2a2020] bg-[#171111] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Key Findings
                  </p>

                  <div className="mt-4 space-y-3">
                    {debrief.key_findings.length === 0 ? (
                      <p className="text-xs text-gray-600">
                        No additional findings were identified.
                      </p>
                    ) : (
                      debrief.key_findings.map((finding, index) => (
                        <div
                          key={`finding-${index}`}
                          className="flex gap-3"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />

                          <p className="text-xs leading-5 text-gray-400">
                            {finding}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a2020] bg-[#171111] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Areas of Concern
                  </p>

                  <div className="mt-4 space-y-3">
                    {debrief.areas_of_concern.length === 0 ? (
                      <p className="text-xs text-emerald-400/80">
                        No areas of concern identified.
                      </p>
                    ) : (
                      debrief.areas_of_concern.map((concern, index) => (
                        <div
                          key={`concern-${index}`}
                          className="flex gap-3"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#e10600]" />

                          <p className="text-xs leading-5 text-gray-400">
                            {concern}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a2020] bg-[#171111] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Recommendations
                  </p>

                  <div className="mt-4 space-y-3">
                    {debrief.recommendations.length === 0 ? (
                      <p className="text-xs text-gray-600">
                        No additional recommendations were generated.
                      </p>
                    ) : (
                      debrief.recommendations.map((recommendation, index) => (
                        <div
                          key={`recommendation-${index}`}
                          className="flex gap-3"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#e10600]" />

                          <p className="text-xs leading-5 text-gray-400">
                            {recommendation}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-10 border-t border-[#202020] pt-6 text-center">

        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700">
          Red Scale · Pilot Assessment Console
        </p>

        <p className="mt-2 text-xs text-gray-700">
          Deterministic assessment · AI-assisted mission debriefing
        </p>

      </footer>

    </div>
  );
}