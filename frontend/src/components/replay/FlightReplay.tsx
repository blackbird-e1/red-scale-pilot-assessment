import { useEffect, useMemo, useState } from 'react';
import { getReplay, type ReplayDataset } from '../../api/replay';
import FlightProfile from './FlightProfile';
import AttitudeIndicator from './AttitudeIndicator';
import AircraftScene from "./AircraftScene";
import IncidentDebrief from './IncidentDebrief';
import DebriefSummary from './DebriefSummary';

interface FlightReplayProps {
  assessmentId: string;
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toFixed(1)
    .padStart(4, '0')}`;
}

function getEventPosition(
  timestamp: number,
  duration: number,
): number {
  if (duration <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, (timestamp / duration) * 100),
  );
}

function getIncidentWindow(
  eventTimestamp: number,
  duration: number,
): {
  start: number;
  end: number;
} {
  return {
    start: Math.max(
      0,
      eventTimestamp - 15,
    ),
    end: Math.min(
      duration,
      eventTimestamp + 15,
    ),
  };
}

function interpolate(
  valueA: number,
  valueB: number,
  factor: number,
): number {
  return valueA + (valueB - valueA) * factor;
}

function getTelemetryAtTime(
  telemetry: ReplayDataset["telemetry"],
  timestamp: number,
): ReplayDataset["telemetry"][number] | null {
  if (telemetry.length === 0) {
    return null;
  }

  if (timestamp <= telemetry[0].timestamp_sec) {
    return telemetry[0];
  }

  const last = telemetry[telemetry.length - 1];

  if (timestamp >= last.timestamp_sec) {
    return last;
  }

  for (let index = 0; index < telemetry.length - 1; index += 1) {
    const current = telemetry[index];
    const next = telemetry[index + 1];

    if (
      timestamp >= current.timestamp_sec &&
      timestamp <= next.timestamp_sec
    ) {
      const duration =
        next.timestamp_sec - current.timestamp_sec;

      const factor =
        duration === 0
          ? 0
          : (timestamp - current.timestamp_sec) /
            duration;

      return {
        ...current,
        timestamp_sec: timestamp,

        altitude_ft: interpolate(
          current.altitude_ft,
          next.altitude_ft,
          factor,
        ),

        indicated_airspeed_knots: interpolate(
          current.indicated_airspeed_knots,
          next.indicated_airspeed_knots,
          factor,
        ),

        pitch_deg: interpolate(
          current.pitch_deg,
          next.pitch_deg,
          factor,
        ),

        roll_deg: interpolate(
          current.roll_deg,
          next.roll_deg,
          factor,
        ),

        vertical_speed_fpm: interpolate(
          current.vertical_speed_fpm,
          next.vertical_speed_fpm,
          factor,
        ),

        bank_angle_deg: interpolate(
          current.bank_angle_deg,
          next.bank_angle_deg,
          factor,
        ),

        throttle_percent: interpolate(
          current.throttle_percent,
          next.throttle_percent,
          factor,
        ),
      };
    }
  }

  return last;
}

function getPrimaryDeviation(
  eventLabel: string,
  context: {
    before: ReplayDataset["telemetry"][number];
    incident: ReplayDataset["telemetry"][number];
    after: ReplayDataset["telemetry"][number];
  },
) {
  const label = eventLabel.toLowerCase();

  if (label.includes('bank')) {
    return {
      metric: 'Bank',
      unit: '°',
      before: context.before.bank_angle_deg,
      incident: context.incident.bank_angle_deg,
      after: context.after.bank_angle_deg,
    };
  }

  if (label.includes('speed')) {
    return {
      metric: 'Airspeed',
      unit: 'kt',
      before: context.before.indicated_airspeed_knots,
      incident: context.incident.indicated_airspeed_knots,
      after: context.after.indicated_airspeed_knots,
    };
  }

  if (label.includes('pitch')) {
    return {
      metric: 'Pitch',
      unit: '°',
      before: context.before.pitch_deg,
      incident: context.incident.pitch_deg,
      after: context.after.pitch_deg,
    };
  }

  if (label.includes('altitude')) {
    return {
      metric: 'Altitude',
      unit: 'ft',
      before: context.before.altitude_ft,
      incident: context.incident.altitude_ft,
      after: context.after.altitude_ft,
    };
  }

  return null;
}

function getPeakDeviation(
  eventLabel: string,
  telemetry: ReplayDataset["telemetry"],
  eventTimestamp: number,
  duration: number,
) {
  const window = getIncidentWindow(eventTimestamp, duration);

  const samples = telemetry.filter(
    (point) =>
      point.timestamp_sec >= window.start &&
      point.timestamp_sec <= window.end,
  );

  if (samples.length === 0) {
    return null;
  }

  const label = eventLabel.toLowerCase();

  if (label.includes('bank')) {
    return samples.reduce((peak, point) =>
      Math.abs(point.bank_angle_deg) > Math.abs(peak.bank_angle_deg)
        ? point
        : peak,
    );
  }

  if (label.includes('speed')) {
    return samples.reduce((peak, point) =>
      point.indicated_airspeed_knots > peak.indicated_airspeed_knots
        ? point
        : peak,
    );
  }

  if (label.includes('pitch')) {
    return samples.reduce((peak, point) =>
      Math.abs(point.pitch_deg) > Math.abs(peak.pitch_deg)
        ? point
        : peak,
    );
  }

  if (label.includes('altitude')) {
    return samples.reduce((peak, point) =>
      Math.abs(point.altitude_ft) > Math.abs(peak.altitude_ft)
        ? point
        : peak,
    );
  }

  return null;
}

export default function FlightReplay({
  assessmentId,
}: FlightReplayProps) {
  const [replay, setReplay] = useState<ReplayDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [activeEvent, setActiveEvent] =
    useState<ReplayDataset["events"][number] | null>(null);

  const [incidentReplay, setIncidentReplay] =
    useState(false);

  const [incidentEndTime, setIncidentEndTime] =
    useState<number | null>(null);

  const [playbackSpeed, setPlaybackSpeed] =
    useState(1);

  const [trainerNotes, setTrainerNotes] = useState({
    strengths: '',
    improvement: '',
    trainingFocus: '',
  });

  const [showDebriefSummary, setShowDebriefSummary] =
    useState(false);

  const [replayComplete, setReplayComplete] = useState(false);
  const selectEvent = (
    event: ReplayDataset["events"][number],
  ) => {
    setActiveEvent(event);
    setIncidentReplay(false);
    setIncidentEndTime(null);
    setCurrentTime(event.timestamp_sec);
    setPlaying(false);
    setReplayComplete(false);

    setTrainerNotes({
      strengths: '',
      improvement: '',
      trainingFocus: '',
    });

    setShowDebriefSummary(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadReplay() {
      setLoading(true);
      setError('');

      try {
        const data = await getReplay(assessmentId);

        if (!cancelled) {
          setReplay(data);
          setCurrentTime(0);
          setReplayComplete(false);
          setTrainerNotes({
            strengths: '',
            improvement: '',
            trainingFocus: '',
          });
          setShowDebriefSummary(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load flight replay.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReplay();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  useEffect(() => {
    if (!playing || !replay) {
      return;
    }

    let lastTime = Date.now();

    const timer = window.setInterval(() => {
      const now = Date.now();

      const elapsedSeconds =
        (now - lastTime) / 1000;

      lastTime = now;

      setCurrentTime((previous) => {
        const endTime =
          incidentReplay && incidentEndTime !== null
            ? incidentEndTime
            : replay.duration_sec;

        const next =
          previous +
          elapsedSeconds * playbackSpeed;

        if (next >= endTime) {
          setPlaying(false);

          if (incidentReplay) {
            setIncidentReplay(false);
            setReplayComplete(true);
          }

          return endTime;
        }

        return next;
      });
    }, 50);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    playing,
    replay,
    playbackSpeed,
    incidentReplay,
    incidentEndTime,
  ]);

  const currentTelemetry = useMemo(() => {
    if (!replay) {
      return null;
    }

    return getTelemetryAtTime(
      replay.telemetry,
      currentTime,
    );
  }, [replay, currentTime]);

  const incidentTelemetry = useMemo(() => {
    if (!replay || !activeEvent) {
      return null;
    }

    return getTelemetryAtTime(
      replay.telemetry,
      activeEvent.timestamp_sec,
    );
  }, [replay, activeEvent]);

  const incidentContext = useMemo(() => {
    if (!replay || !activeEvent) {
      return null;
    }

    return {
      before: getTelemetryAtTime(
        replay.telemetry,
        activeEvent.timestamp_sec - 10,
      ),

      incident: getTelemetryAtTime(
        replay.telemetry,
        activeEvent.timestamp_sec,
      ),

      after: getTelemetryAtTime(
        replay.telemetry,
        activeEvent.timestamp_sec + 10,
      ),
    };
  }, [replay, activeEvent]);

  const primaryDeviation = useMemo(() => {
    if (
      !incidentContext ||
      !activeEvent ||
      !incidentContext.before ||
      !incidentContext.incident ||
      !incidentContext.after
    ) {
      return null;
    }

    return getPrimaryDeviation(
      activeEvent.label,
      {
        before: incidentContext.before,
        incident: incidentContext.incident,
        after: incidentContext.after,
      },
    );
  }, [incidentContext, activeEvent]);

  const peakDeviation = useMemo(() => {
    if (!replay || !activeEvent) {
      return null;
    }

    return getPeakDeviation(
      activeEvent.label,
      replay.telemetry,
      activeEvent.timestamp_sec,
      replay.duration_sec,
    );
  }, [replay, activeEvent]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-[#292929] bg-[#111111] p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
          Flight Replay
        </p>

        <h2 className="mt-3 text-xl font-semibold text-white">
          Loading replay...
        </h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-[#151010] p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-400">
          Flight Replay
        </p>

        <p className="mt-3 text-sm text-red-300">
          {error}
        </p>
      </section>
    );
  }

  if (!replay || !currentTelemetry) {
    return (
      <section className="rounded-3xl border border-[#292929] bg-[#111111] p-8">
        <p className="text-sm text-gray-500">
          No replay telemetry available.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
            Flight Replay
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            {replay.source_filename}
          </h2>

          <p className="mt-1 text-xs text-gray-600">
            Interactive telemetry replay
          </p>
        </div>

        <div className="flex items-center gap-3">
          {incidentReplay && (
            <span className="rounded-full border border-[#e10600]/40 bg-[#1a1010] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#e10600]">
              Incident Replay
            </span>
          )}

          {replayComplete && (
            <span className="rounded-full border border-[#292929] bg-[#151515] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500">
              Replay Complete
            </span>
          )}

          <div className="font-mono text-sm text-gray-400">
            {formatTime(currentTime)}
            {' / '}
            {formatTime(replay.duration_sec)}
          </div>
        </div>
      </div>

      <FlightProfile
            telemetry={replay.telemetry}
            currentTime={currentTime}
      />

      <div className="mt-4">
        <AttitudeIndicator telemetry={currentTelemetry} />
      </div>

      {/* Telemetry HUD */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <Metric
          label="Altitude"
          value={Math.round(
            currentTelemetry.altitude_ft,
          ).toLocaleString()}
          unit="ft"
        />

        <Metric
          label="Airspeed"
          value={Math.round(
            currentTelemetry.indicated_airspeed_knots,
          ).toString()}
          unit="kt"
        />

        <Metric
          label="Pitch"
          value={currentTelemetry.pitch_deg.toFixed(1)}
          unit="°"
        />

        <Metric
          label="Bank"
          value={currentTelemetry.bank_angle_deg.toFixed(1)}
          unit="°"
        />

      </div>

      {/* 3D Aircraft Replay */}
        <div className="mt-4">
        <AircraftScene
            telemetry={replay.telemetry}
            currentTelemetry={currentTelemetry}
            events={replay.events}
        />
        </div>

      {/* Timeline */}
        <div className="mt-8">

        <div className="relative">

            {/* Violation markers */}
            {replay.events.map((event, index) => {
            const position = getEventPosition(
                event.timestamp_sec,
                replay.duration_sec,
            );

            const isActive =
              activeEvent?.timestamp_sec === event.timestamp_sec;

            return (
                <button
                key={`${event.timestamp_sec}-${event.label}-${index}`}
                type="button"
                title={`${event.label} — ${formatTime(
                    event.timestamp_sec,
                )}`}
                onClick={() => {
                  selectEvent(event);
                }}
                className="group absolute top-[-24px] z-20 -translate-x-1/2"
                style={{
                    left: `${position}%`,
                }}
                >
                <div
                    className={`h-3 w-3 rounded-full border-2 transition-all ${
                    isActive
                        ? 'scale-125 border-white bg-[#e10600]'
                        : 'border-[#e10600] bg-[#111111] group-hover:scale-125 group-hover:bg-[#e10600]'
                    }`}
                />

                <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#333333] bg-[#151515] px-3 py-2 text-left shadow-xl group-hover:block">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#e10600]">
                    Violation
                    </p>

                    <p className="mt-1 text-xs font-semibold text-white">
                    {event.label}
                    </p>

                    <p className="mt-1 font-mono text-[10px] text-gray-500">
                    {formatTime(event.timestamp_sec)}
                    {event.severity
                        ? ` · ${event.severity}`
                        : ''}
                    </p>

                </div>
                </button>
            );
            })}

            {/* Timeline track */}
            <input
            type="range"
            min={0}
            max={replay.duration_sec}
            step={0.1}
            value={currentTime}
            onChange={(event) => {
              setCurrentTime(
                Number(event.target.value),
              );

              setIncidentReplay(false);
              setIncidentEndTime(null);
              setReplayComplete(false);
            }}
            className="relative z-10 w-full accent-[#e10600]"
            />

        </div>

        <div className="mt-2 flex justify-between text-[10px] font-mono text-gray-600">
            <span>00:00</span>

            <span>
            {formatTime(replay.duration_sec)}
            </span>
        </div>

        </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

        <button
          type="button"
          onClick={() => {
            setCurrentTime(0);
            setPlaying(false);
            setActiveEvent(null);
            setIncidentReplay(false);
            setIncidentEndTime(null);
            setReplayComplete(false);
            setTrainerNotes({
              strengths: '',
              improvement: '',
              trainingFocus: '',
            });
            setShowDebriefSummary(false);
          }}
          className="rounded-xl border border-[#303030] bg-[#171717] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 transition-colors hover:border-[#e10600]/40 hover:text-white"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentTime >= replay.duration_sec) {
              setCurrentTime(0);
            }

            setPlaying((previous) => !previous);
          }}
          className="rounded-xl border border-[#e10600]/40 bg-[#1a1010] px-6 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#241313]"
        >
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center rounded-xl border border-[#292929] bg-[#151515] p-1">
          {[0.5, 1, 2].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => {
                setPlaybackSpeed(speed);
              }}
              className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${
                playbackSpeed === speed
                  ? 'bg-[#e10600] text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>
        
        {activeEvent && incidentTelemetry && (
          <IncidentDebrief
            activeEvent={activeEvent}
            incidentTelemetry={incidentTelemetry}
            incidentContext={incidentContext}
            primaryDeviation={primaryDeviation}
            peakDeviation={peakDeviation}
            trainerNotes={trainerNotes}
            onTrainerNotesChange={(field, value) => {
              setTrainerNotes((previous) => ({
                ...previous,
                [field]: value,
              }));
              setShowDebriefSummary(false);
            }}
            onSaveTrainerNotes={() => {
              setShowDebriefSummary(true);
            }}
            onReplayIncident={() => {
              const window = getIncidentWindow(
                activeEvent.timestamp_sec,
                replay.duration_sec,
              );

              setCurrentTime(window.start);
              setIncidentEndTime(window.end);
              setIncidentReplay(true);
              setReplayComplete(false);
              setPlaying(true);
            }}
          />
        )}

        {showDebriefSummary &&
          activeEvent &&
          primaryDeviation && (
            <DebriefSummary
              activeEvent={activeEvent}
              primaryDeviation={primaryDeviation}
              peakDeviation={peakDeviation}
              strengths={trainerNotes.strengths}
              improvement={trainerNotes.improvement}
              trainingFocus={trainerNotes.trainingFocus}
            />
          )}

        {replay.events.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">

            {replay.events.map((event, index) => {
            const isActive =
              activeEvent?.timestamp_sec === event.timestamp_sec;

            return (
                <button
                key={`${event.timestamp_sec}-${event.label}-${index}`}
                type="button"
                onClick={() => {
                  selectEvent(event);
                }}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    isActive
                    ? 'border-[#e10600]/60 bg-[#1d1010]'
                    : 'border-[#292929] bg-[#151515] hover:border-[#444444]'
                }`}
                >
                <div className="flex items-center gap-2">

                    <span
                    className={`h-2 w-2 rounded-full ${
                        event.severity === 'medium'
                        ? 'bg-[#e10600]'
                        : 'bg-gray-500'
                    }`}
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    {event.label}
                    </span>

                </div>

                <div className="mt-1 font-mono text-[10px] text-gray-600">
                    {formatTime(event.timestamp_sec)}
                    {' · '}
                    {event.severity || 'unknown'}
                </div>
                </button>
            );
            })}

        </div>
        )}

    </section>
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