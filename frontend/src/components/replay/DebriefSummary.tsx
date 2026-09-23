import type { ReplayDataset } from '../../api/replay';

type ReplayEvent = ReplayDataset['events'][number];

interface PrimaryDeviation {
  metric: string;
  unit: string;
  before: number;
  incident: number;
  after: number;
}

interface DebriefSummaryProps {
  activeEvent: ReplayEvent;
  primaryDeviation: PrimaryDeviation | null;
  peakDeviation: ReplayDataset['telemetry'][number] | null;
  strengths: string;
  improvement: string;
  trainingFocus: string;
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toFixed(1)
    .padStart(4, '0')}`;
}

function getPeakValue(
  metric: string,
  peakDeviation: ReplayDataset['telemetry'][number],
): string {
  if (metric === 'Bank') {
    return peakDeviation.bank_angle_deg.toFixed(1);
  }

  if (metric === 'Airspeed') {
    return peakDeviation.indicated_airspeed_knots.toFixed(1);
  }

  if (metric === 'Pitch') {
    return peakDeviation.pitch_deg.toFixed(1);
  }

  return peakDeviation.altitude_ft.toFixed(1);
}

export default function DebriefSummary({
  activeEvent,
  primaryDeviation,
  peakDeviation,
  strengths,
  improvement,
  trainingFocus,
}: DebriefSummaryProps) {
  return (
    <div className="mt-4 rounded-2xl border border-[#292929] bg-[#111111] p-5">

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          Flight Debrief
        </p>

        <h3 className="mt-2 text-lg font-semibold text-white">
          {activeEvent.label}
        </h3>

        <p className="mt-1 font-mono text-[10px] text-gray-500">
          {formatTime(activeEvent.timestamp_sec)}
          {activeEvent.severity
            ? ` · ${activeEvent.severity}`
            : ''}
        </p>
      </div>

      {primaryDeviation && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          <div className="rounded-xl border border-[#292929] bg-[#151515] p-4">

            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Primary Deviation
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {primaryDeviation.metric}
            </p>

            <p className="mt-1 font-mono text-xl font-semibold text-white">
              {primaryDeviation.incident.toFixed(1)}
              <span className="ml-1 text-xs text-gray-600">
                {primaryDeviation.unit}
              </span>
            </p>

            {peakDeviation && (
              <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-gray-600">
                Peak:{' '}
                <span className="font-mono text-[#e10600]">
                  {getPeakValue(
                    primaryDeviation.metric,
                    peakDeviation,
                  )}{' '}
                  {primaryDeviation.unit}
                </span>
              </p>
            )}

          </div>

          <div className="rounded-xl border border-[#292929] bg-[#151515] p-4">

            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Trend
            </p>

            <p className="mt-3 font-mono text-sm text-gray-400">
              {primaryDeviation.before.toFixed(1)}
              {' → '}

              <span className="font-semibold text-[#e10600]">
                {primaryDeviation.incident.toFixed(1)}
              </span>

              {' → '}

              {primaryDeviation.after.toFixed(1)}
              {' '}
              {primaryDeviation.unit}
            </p>

          </div>

        </div>
      )}

      <div className="mt-4 space-y-3">

        <SummaryBlock
          title="What the pilot did well"
          value={strengths}
          emptyText="No strengths recorded."
        />

        <SummaryBlock
          title="Areas for improvement"
          value={improvement}
          emptyText="No improvement notes recorded."
        />

        <SummaryBlock
          title="Recommended training focus"
          value={trainingFocus}
          emptyText="No training focus recorded."
        />

      </div>

    </div>
  );
}

function SummaryBlock({
  title,
  value,
  emptyText,
}: {
  title: string;
  value: string;
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-[#292929] bg-[#151515] p-4">

      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-gray-300">
        {value.trim() || emptyText}
      </p>

    </div>
  );
}