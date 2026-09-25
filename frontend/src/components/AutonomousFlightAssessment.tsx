import { useEffect, useState } from "react";
import type {
  TornadoAssessmentResult,
  TornadoExampleFlight,
} from "../types";

interface AutonomousFlightAssessmentProps {
  onBack: () => void;
}

export default function AutonomousFlightAssessment({
  onBack,
}: AutonomousFlightAssessmentProps) {
  const [examples, setExamples] = useState<TornadoExampleFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>("");
  const [result, setResult] = useState<TornadoAssessmentResult | null>(null);

  const [loadingExamples, setLoadingExamples] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExamples();
  }, []);

  async function loadExamples() {
    try {
      setLoadingExamples(true);
      setError("");

      const response = await fetch("/api/v1/tornado/examples");

      if (!response.ok) {
        throw new Error("Failed to load example flights.");
      }

      const data: TornadoExampleFlight[] = await response.json();

      setExamples(data);

      if (data.length > 0) {
        setSelectedFlight(data[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load example flights.",
      );
    } finally {
      setLoadingExamples(false);
    }
  }

  async function assessFlight() {
    if (!selectedFlight) {
      return;
    }

    try {
      setAssessing(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `/api/v1/tornado/examples/${selectedFlight}/assess`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to assess the selected flight.");
      }

      const data: TornadoAssessmentResult = await response.json();

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assess the selected flight.",
      );
    } finally {
      setAssessing(false);
    }
  }

  function formatNumber(value: number, decimals = 2) {
    return value.toFixed(decimals);
  }

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-white"
        >
          ← Back to Red Scale
        </button>

        <section className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-2">
            <span className="rounded-full border border-[#e10600]/30 bg-[#171111] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
              Tornado
            </span>

            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">
              Autonomous Flight Assessment
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Autonomous Flight Assessment
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            Evaluate recorded autonomous drone flight telemetry for trajectory,
            stability, attitude, and control behaviour.
          </p>

          {!result && (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Input
                  </p>

                  <p className="mt-3 text-sm font-medium text-gray-300">
                    Autonomous flight telemetry
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Recorded flight data from an autonomous vehicle.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Assessment
                  </p>

                  <p className="mt-3 text-sm font-medium text-gray-300">
                    Five experimental metrics
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Trajectory, position, velocity, attitude, and control
                    stability.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e10600]/20 bg-[#1a1212] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                    Output
                  </p>

                  <p className="mt-3 text-sm font-medium text-gray-300">
                    Evidence + AI debrief
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Deterministic findings followed by an AI-generated
                    explanation.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#252525] bg-[#0f0f0f] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                      Example Flights
                    </p>

                    <h2 className="mt-2 text-lg font-medium text-white">
                      Select an autonomous flight
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      Start with a preloaded TII autonomous flight.
                    </p>
                  </div>

                  {examples.length > 0 && (
                    <button
                      type="button"
                      onClick={assessFlight}
                      disabled={assessing || loadingExamples}
                      className="rounded-xl bg-[#e10600] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assessing ? "Assessing..." : "Assess Flight"}
                    </button>
                  )}
                </div>

                {loadingExamples && (
                  <div className="mt-6 rounded-xl border border-[#252525] bg-[#151515] p-5">
                    <p className="text-sm text-gray-500">
                      Loading example flights...
                    </p>
                  </div>
                )}

                {!loadingExamples && examples.length === 0 && !error && (
                  <div className="mt-6 rounded-xl border border-dashed border-[#333333] p-5">
                    <p className="text-sm text-gray-500">
                      No example flights are currently available.
                    </p>
                  </div>
                )}

                {!loadingExamples && examples.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {examples.map((flight) => (
                      <button
                        key={flight.id}
                        type="button"
                        onClick={() => setSelectedFlight(flight.id)}
                        className={`w-full rounded-xl border p-5 text-left transition-colors ${
                          selectedFlight === flight.id
                            ? "border-[#e10600]/50 bg-[#1a1212]"
                            : "border-[#252525] bg-[#151515] hover:border-[#3a3a3a]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              {flight.name}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-gray-600">
                              {flight.description}
                            </p>
                          </div>

                          <span
                            className={`h-3 w-3 shrink-0 rounded-full border ${
                              selectedFlight === flight.id
                                ? "border-[#e10600] bg-[#e10600]"
                                : "border-[#555555]"
                            }`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/20 p-5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#252525] bg-[#0f0f0f] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Assessment Complete
                  </p>

                  <h2 className="mt-2 text-xl font-medium text-white">
                    {result.flight_id}
                  </h2>

                  <p className="mt-2 text-xs text-gray-600">
                    Flight duration: {formatNumber(result.duration_sec)} s
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="rounded-xl border border-[#333333] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 transition-colors hover:border-[#555555] hover:text-white"
                >
                  Assess Another
                </button>
              </div>

              <section className="rounded-2xl border border-[#252525] bg-[#111111] p-6">
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Metrics
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-white">
                    Flight behaviour
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    title="Trajectory Deviation"
                    value={formatNumber(
                      result.metrics.trajectory_deviation.rmse_m,
                    )}
                    unit="m RMSE"
                    detail={`Peak ${formatNumber(
                      result.metrics.trajectory_deviation.max_error_m,
                    )} m`}
                  />

                  <MetricCard
                    title="Position Stability"
                    value={formatNumber(
                      result.metrics.position_stability.overall_std_m,
                    )}
                    unit="m std"
                    detail="Position dispersion"
                  />

                  <MetricCard
                    title="Velocity Stability"
                    value={formatNumber(
                      result.metrics.velocity_stability.overall_std_ms,
                    )}
                    unit="m/s std"
                    detail={`Max ${formatNumber(
                      result.metrics.velocity_stability.max_speed_ms,
                    )} m/s`}
                  />

                  <MetricCard
                    title="Attitude Stability"
                    value={formatNumber(
                      result.metrics.attitude_stability.overall_std_deg,
                    )}
                    unit="deg std"
                    detail="Roll / pitch / yaw"
                  />

                  <MetricCard
                    title="Control Smoothness"
                    value={formatNumber(
                      result.metrics.control_smoothness.overall_mean_change,
                    )}
                    unit="change"
                    detail={`Peak ${formatNumber(
                      result.metrics.control_smoothness.max_control_change,
                    )}`}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-[#252525] bg-[#111111] p-6">
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Evidence
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-white">
                    Detected events
                  </h2>
                </div>

                {result.events.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#333333] p-5">
                    <p className="text-sm text-gray-500">
                      No threshold-based trajectory deviation events detected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.events.map((event, index) => (
                      <div
                        key={`${event.timestamp_sec}-${index}`}
                        className="rounded-xl border border-[#252525] bg-[#151515] p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              {event.type}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-gray-500">
                              {event.description}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#e10600]">
                            {formatNumber(event.timestamp_sec)} s
                          </span>
                        </div>

                        {event.evidence.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {event.evidence.map((evidence, evidenceIndex) => (
                              <div
                                key={`${evidence.metric}-${evidenceIndex}`}
                                className="flex flex-col gap-1 border-l border-[#333333] pl-3"
                              >
                                <p className="text-xs text-gray-400">
                                  {evidence.description}
                                </p>

                                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-600">
                                  {evidence.metric}:{" "}
                                  {formatNumber(evidence.value)}{" "}
                                  {evidence.unit}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-[#e10600]/20 bg-[#171111] p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                  AI Debrief
                </p>

                <h2 className="mt-2 text-lg font-medium text-white">
                  Coming next
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                  The deterministic assessment is now available. The next
                  step is to pass these findings and timestamped evidence into
                  the existing AI debrief architecture.
                </p>
              </section>
            </div>
          )}

          <div className="mt-8 border-t border-[#222222] pt-5">
            <p className="text-[10px] leading-5 text-gray-600">
              TORNADO metrics are experimental POC measurements and are not
              presented as industry-certified autonomous-flight safety
              criteria.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  detail: string;
}

function MetricCard({
  title,
  value,
  unit,
  detail,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[#252525] bg-[#151515] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
        {title}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{value}</span>

        <span className="text-[10px] uppercase tracking-[0.12em] text-gray-600">
          {unit}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-600">{detail}</p>
    </div>
  );
}