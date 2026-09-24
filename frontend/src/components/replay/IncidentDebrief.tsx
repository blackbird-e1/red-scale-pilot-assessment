import type { ReplayDataset } from '../../api/replay';

type ReplayEvent = ReplayDataset['events'][number];
type TelemetryPoint = ReplayDataset['telemetry'][number];

interface IncidentContext {
  before: TelemetryPoint | null;
  incident: TelemetryPoint | null;
  after: TelemetryPoint | null;
}

interface PrimaryDeviation {
  metric: string;
  unit: string;
  before: number;
  incident: number;
  after: number;
}

interface IncidentDebriefProps {
  activeEvent: ReplayEvent;
  incidentTelemetry: TelemetryPoint;
  incidentContext: IncidentContext | null;
  primaryDeviation: PrimaryDeviation | null;
  peakDeviation: TelemetryPoint | null;
  trainerNotes: {
    strengths: string;
    improvement: string;
    trainingFocus: string;
  };
  onTrainerNotesChange: (
    field: 'strengths' | 'improvement' | 'trainingFocus',
    value: string,
  ) => void;
  onSaveTrainerNotes: () => void;
  onReplayIncident: () => void;
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toFixed(1)
    .padStart(4, '0')}`;
}

export default function IncidentDebrief({
  activeEvent,
  incidentTelemetry,
  incidentContext,
  primaryDeviation,
  peakDeviation,
  trainerNotes,
  onTrainerNotesChange,
  onSaveTrainerNotes,
  onReplayIncident,
}: IncidentDebriefProps) {
  

  return (
    <div className="mt-5 rounded-2xl border border-[#e10600]/30 bg-[#151010] p-5">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e10600]">
            Selected Incident
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

        <div className="rounded-full border border-[#333333] bg-[#151515] px-3 py-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500">
            Incident Snapshot
          </span>
        </div>

      </div>

      {/* Telemetry snapshot */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <Metric
          label="Altitude"
          value={Math.round(
            incidentTelemetry.altitude_ft,
          ).toLocaleString()}
          unit="ft"
        />

        <Metric
          label="Airspeed"
          value={Math.round(
            incidentTelemetry.indicated_airspeed_knots,
          ).toString()}
          unit="kt"
        />

        <Metric
          label="Pitch"
          value={incidentTelemetry.pitch_deg.toFixed(1)}
          unit="°"
        />

        <Metric
          label="Bank"
          value={incidentTelemetry.bank_angle_deg.toFixed(1)}
          unit="°"
        />

      </div>

      {/* Primary Deviation */}
      {primaryDeviation && (
        <div className="mt-4 rounded-xl border border-[#e10600]/30 bg-[#1a1010] p-4">

          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e10600]">
            Primary Deviation
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">

            <div>
              <p className="text-xs text-gray-500">
                {primaryDeviation.metric}
              </p>

              <p className="mt-1 font-mono text-xl font-semibold text-white">
                {primaryDeviation.incident.toFixed(1)}
                <span className="ml-1 text-xs text-gray-600">
                  {primaryDeviation.unit}
                </span>
              </p>

              {peakDeviation && (
                <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-gray-600">
                  Peak in window:{' '}
                  <span className="font-mono text-[#e10600]">
                    {primaryDeviation.metric === 'Bank'
                      ? peakDeviation.bank_angle_deg.toFixed(1)
                      : primaryDeviation.metric === 'Airspeed'
                        ? peakDeviation.indicated_airspeed_knots.toFixed(1)
                        : primaryDeviation.metric === 'Pitch'
                          ? peakDeviation.pitch_deg.toFixed(1)
                          : peakDeviation.altitude_ft.toFixed(1)}
                    {' '}
                    {primaryDeviation.unit}
                  </span>
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.15em] text-gray-600">
                Trend
              </p>

              <p className="mt-1 font-mono text-xs text-gray-400">
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

        </div>
      )}

      {/* CBTA Assessment */}
      {(activeEvent.competency_name ||
        activeEvent.behaviour_name ||
        activeEvent.evidence) && (
        <div className="mt-4 rounded-xl border border-[#292929] bg-[#111111] p-4">

          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
            CBTA Assessment
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            {activeEvent.competency_name && (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Competency
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {activeEvent.competency_name}
                </p>
              </div>
            )}

            {activeEvent.behaviour_name && (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Observable Behaviour
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {activeEvent.behaviour_name}
                </p>
              </div>
            )}

          </div>

          {activeEvent.evidence && (
            <div className="mt-4 rounded-lg border border-[#292929] bg-[#151515] p-3">

              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                Benchmark Evidence
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-gray-600">
                    Metric
                  </p>

                  <p className="mt-1 font-mono text-xs text-gray-300">
                    {activeEvent.evidence.metric}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-gray-600">
                    Value
                  </p>

                  <p className="mt-1 font-mono text-xs font-semibold text-white">
                    {activeEvent.evidence.value.toFixed(1)}
                  </p>
                </div>

                {activeEvent.evidence.timestamp_sec !== null &&
                  activeEvent.evidence.timestamp_sec !== undefined && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-gray-600">
                        Evidence Timestamp
                      </p>

                      <p className="mt-1 font-mono text-xs text-[#e10600]">
                        {formatTime(
                          activeEvent.evidence.timestamp_sec,
                        )}
                      </p>
                    </div>
                  )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* Incident Trend */}
      {incidentContext?.before &&
        incidentContext.incident &&
        incidentContext.after && (
          <div className="mt-4 rounded-xl border border-[#292929] bg-[#111111] p-4">

            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
              Incident Trend
            </p>

            <div className="mt-4 overflow-x-auto">

              <table className="w-full min-w-[520px] text-left">

                <thead>
                  <tr className="border-b border-[#292929]">

                    <th className="pb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Metric
                    </th>

                    <th className="pb-3 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Before
                    </th>

                    <th className="pb-3 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-[#e10600]">
                      Incident
                    </th>

                    <th className="pb-3 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      After
                    </th>

                  </tr>
                </thead>

                <tbody>

                  <tr className="border-b border-[#1f1f1f]">

                    <td className="py-3 text-xs text-gray-400">
                      Altitude
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-gray-300">
                      {Math.round(
                        incidentContext.before.altitude_ft,
                      ).toLocaleString()} ft
                    </td>

                    <td className="py-3 text-right font-mono text-xs font-semibold text-white">
                      {Math.round(
                        incidentContext.incident.altitude_ft,
                      ).toLocaleString()} ft
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-gray-300">
                      {Math.round(
                        incidentContext.after.altitude_ft,
                      ).toLocaleString()} ft
                    </td>

                  </tr>

                  <tr className="border-b border-[#1f1f1f]">

                    <td className="py-3 text-xs text-gray-400">
                      Airspeed
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-gray-300">
                      {Math.round(
                        incidentContext.before.indicated_airspeed_knots,
                      )} kt
                    </td>

                    <td className="py-3 text-right font-mono text-xs font-semibold text-white">
                      {Math.round(
                        incidentContext.incident.indicated_airspeed_knots,
                      )} kt
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-gray-300">
                      {Math.round(
                        incidentContext.after.indicated_airspeed_knots,
                      )} kt
                    </td>

                  </tr>

                  <tr className="border-b border-[#1f1f1f]">

                    <td className="py-3 text-xs text-gray-400">
                      Pitch
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-gray-300">
                      {incidentContext.before.pitch_deg.toFixed(1)}°
                    </td>

                    <td className="py-3 text-right font-mono text-xs font-semibold text-white">
                      {incidentContext.incident.pitch_deg.toFixed(1)}°
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-gray-300">
                      {incidentContext.after.pitch_deg.toFixed(1)}°
                    </td>

                  </tr>

                  <tr>

                    <td className="pt-3 text-xs text-gray-400">
                      Bank
                    </td>

                    <td className="pt-3 text-right font-mono text-xs text-gray-300">
                      {incidentContext.before.bank_angle_deg.toFixed(1)}°
                    </td>

                    <td className="pt-3 text-right font-mono text-xs font-semibold text-[#e10600]">
                      {incidentContext.incident.bank_angle_deg.toFixed(1)}°
                    </td>

                    <td className="pt-3 text-right font-mono text-xs text-gray-300">
                      {incidentContext.after.bank_angle_deg.toFixed(1)}°
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* Trainer Notes */}
      <div className="mt-4 rounded-xl border border-[#292929] bg-[#111111] p-4">

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
            Trainer Notes
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Record observations from the incident review.
          </p>
        </div>

        <div className="mt-4 space-y-4">

          <div>
            <label
              htmlFor="trainer-strengths"
              className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500"
            >
              What did the pilot do well?
            </label>

            <textarea
              id="trainer-strengths"
              value={trainerNotes.strengths}
              onChange={(event) => {
                onTrainerNotesChange(
                  'strengths',
                  event.target.value,
                );
              }}
              rows={3}
              placeholder="Record positive observations..."
              className="mt-2 w-full resize-none rounded-lg border border-[#292929] bg-[#151515] p-3 text-xs text-gray-300 outline-none placeholder:text-gray-700 focus:border-[#444444]"
            />
          </div>

          <div>
            <label
              htmlFor="trainer-improvement"
              className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500"
            >
              What needs improvement?
            </label>

            <textarea
              id="trainer-improvement"
              value={trainerNotes.improvement}
              onChange={(event) => {
                onTrainerNotesChange(
                  'improvement',
                  event.target.value,
                );
              }}
              rows={3}
              placeholder="Record areas requiring improvement..."
              className="mt-2 w-full resize-none rounded-lg border border-[#292929] bg-[#151515] p-3 text-xs text-gray-300 outline-none placeholder:text-gray-700 focus:border-[#444444]"
            />
          </div>

          <div>
            <label
              htmlFor="trainer-focus"
              className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500"
            >
              Recommended training focus
            </label>

            <textarea
              id="trainer-focus"
              value={trainerNotes.trainingFocus}
              onChange={(event) => {
                onTrainerNotesChange(
                  'trainingFocus',
                  event.target.value,
                );
              }}
              rows={3}
              placeholder="Record the recommended training focus..."
              className="mt-2 w-full resize-none rounded-lg border border-[#292929] bg-[#151515] p-3 text-xs text-gray-300 outline-none placeholder:text-gray-700 focus:border-[#444444]"
            />
          </div>

        </div>

        <button
          type="button"
          onClick={onSaveTrainerNotes}
          className="mt-4 w-full rounded-xl border border-[#292929] bg-[#151515] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-300 transition-colors hover:border-[#e10600]/40 hover:text-white"
        >
          Generate Debrief Summary
        </button>

      </div>

      {/* Replay action */}
      <button
        type="button"
        onClick={onReplayIncident}
        className="mt-4 w-full rounded-xl border border-[#e10600]/50 bg-[#1a1010] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#241313]"
      >
        Replay Incident
      </button>

    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-[#292929] bg-[#151515] p-4">

      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">

        <span className="text-lg font-semibold text-white">
          {value}
        </span>

        <span className="text-[10px] text-gray-600">
          {unit}
        </span>

      </div>

    </div>
  );
}