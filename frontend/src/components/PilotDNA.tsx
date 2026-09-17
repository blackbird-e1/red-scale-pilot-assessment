import { useEffect, useState } from 'react';
import { getPilotDNA } from '../api/assessment';
import type { PilotDNA as PilotDNAType } from '../types';

function formatRuleName(ruleName: string) {
  const displayNames: Record<string, string> = {
    'Max Speed Knots': 'Speed Management',
    'Max Bank Angle Deg': 'Bank Angle Management',
    'Max Descent Rate Fpm': 'Descent Rate Management',
  };

  return displayNames[ruleName] || ruleName;
}
interface PilotDNAProps {
  pilotId: string;
}

export default function PilotDNA({ pilotId }: PilotDNAProps) {
  const [dna, setDna] = useState<PilotDNAType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPilotDNA() {
      try {
        setLoading(true);
        setError(null);

        const data = await getPilotDNA(pilotId);

        setDna(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unable to load Pilot DNA.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadPilotDNA();
  }, [pilotId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading Pilot DNA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No Pilot DNA available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Pilot DNA
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Longitudinal view of pilot performance and recurring patterns.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Assessments
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {dna.assessment_count}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Average Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {dna.average_risk !== null
              ? dna.average_risk.toFixed(2)
              : '—'}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Latest Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {dna.latest_risk !== null
              ? dna.latest_risk.toFixed(2)
              : '—'}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Risk Trend
          </p>

          <p className="mt-2 text-xl font-semibold capitalize text-gray-900">
            {dna.risk_trend.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Risk progression */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Risk Progression
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Risk across the pilot's assessment history.
        </p>

        <div className="mt-6">
          {dna.risk_history.length === 0 ? (
            <p className="text-sm text-gray-500">
              Not enough assessment data to show risk progression.
            </p>
          ) : dna.risk_history.length === 1 ? (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Assessment 1
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-900">
                Risk: {dna.risk_history[0].toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                A trend requires at least two assessments.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <svg
                viewBox="0 0 800 300"
                preserveAspectRatio="none"
                className="h-72 w-full"
                role="img"
                aria-label="Risk progression across assessment history"
              >
                {(() => {
                  const risks = dna.risk_history;
                  const chartWidth = 680;
                  const chartHeight = 220;
                  const leftPadding = 70;
                  const rightPadding = 30;
                  const topPadding = 25;
                  const bottomPadding = 55;

                  const maxRisk = 100;
                  const minRisk = 0;

                  const innerWidth =
                    chartWidth - leftPadding - rightPadding;

                  const innerHeight =
                    chartHeight - topPadding - bottomPadding;

                  const xStep =
                    risks.length > 1
                      ? innerWidth / (risks.length - 1)
                      : 0;

                  const getX = (index: number) =>
                    leftPadding + index * xStep;

                  const getY = (risk: number) => {
                    const clampedRisk = Math.max(
                      minRisk,
                      Math.min(maxRisk, risk),
                    );

                    return (
                      topPadding +
                      innerHeight -
                      (clampedRisk / maxRisk) * innerHeight
                    );
                  };

                  const points = risks.map((risk, index) => ({
                    x: getX(index),
                    y: getY(risk),
                    risk,
                  }));

                  const linePoints = points
                    .map((point) => `${point.x},${point.y}`)
                    .join(' ');

                  const yAxisValues = [
                    100,
                    80,
                    60,
                    40,
                    20,
                    0,
                  ];

                  return (
                    <>
                      {/* Y-axis grid */}
                      {yAxisValues.map((value) => {
                        const y = getY(value);

                        return (
                          <g key={value}>
                            <line
                              x1={leftPadding}
                              x2={chartWidth - rightPadding}
                              y1={y}
                              y2={y}
                              stroke="currentColor"
                              strokeWidth="1"
                              className="text-gray-100"
                            />

                            <text
                              x={leftPadding - 12}
                              y={y + 4}
                              textAnchor="end"
                              className="fill-gray-400 text-[11px]"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}

                      {/* X-axis */}
                      <line
                        x1={leftPadding}
                        x2={chartWidth - rightPadding}
                        y1={topPadding + innerHeight}
                        y2={topPadding + innerHeight}
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-gray-200"
                      />

                      {/* Risk line */}
                      <polyline
                        points={linePoints}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-700"
                      />

                      {/* Assessment points */}
                      {points.map((point, index) => (
                        <g key={`${index}-${point.risk}`}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            className="fill-gray-700"
                          />

                          <text
                            x={point.x}
                            y={point.y - 12}
                            textAnchor="middle"
                            className="fill-gray-900 text-[11px] font-semibold"
                          >
                            {point.risk.toFixed(2)}
                          </text>

                          <text
                            x={point.x}
                            y={chartHeight - 15}
                            textAnchor="middle"
                            className="fill-gray-500 text-[10px]"
                          >
                            Assessment {index + 1}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Strengths and weaknesses */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Strengths */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Strengths
          </h2>

          {dna.strengths.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No strengths identified yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {dna.strengths.map((strength) => (
                <li
                  key={strength}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm text-gray-700">
                      ✓
                    </span>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {strength}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Observed across the pilot's assessment history.
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Areas to Improve */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Areas to Improve
          </h2>

          {dna.weaknesses.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No weaknesses identified yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {dna.weaknesses.map((weakness) => {
                const matchingViolation =
                  dna.recurring_violations.find(
                    (violation) =>
                      violation.rule_name === weakness,
                  );

                return (
                  <li
                    key={weakness}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-sm">
                        ⚠
                      </span>

                      <div>
                        <p className="font-medium text-gray-900">
                          {formatRuleName(weakness)}
                        </p>

                        {matchingViolation ? (
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            Recurring across{' '}
                            {matchingViolation.occurrences} of{' '}
                            {matchingViolation.total_assessments}{' '}
                            assessments.
                          </p>
                        ) : (
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            Identified as an area to improve from
                            assessment history.
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>

      {/* Recurring violations */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Recurring Violations
        </h2>

        {dna.recurring_violations.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No recurring violations detected.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {dna.recurring_violations.map((violation) => (
              <div
                key={violation.rule_id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatRuleName(violation.rule_name)}
                    </p>

                    <p className="text-sm text-gray-500">
                      {violation.occurrences} of{' '}
                      {violation.total_assessments} assessments
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {violation.percentage.toFixed(0)}%
                    </p>

                    <p className="text-xs text-gray-500">
                      Recurrence
                    </p>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Severity: {violation.severity}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-700"
                    style={{
                      width: `${Math.min(
                        violation.percentage,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
