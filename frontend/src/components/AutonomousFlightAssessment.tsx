import { useEffect, useRef, useState } from "react";
import type {
  DebriefResponse,
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

  const [debrief, setDebrief] = useState<DebriefResponse | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefError, setDebriefError] = useState("");

  const [telemetryFile, setTelemetryFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [flightId, setFlightId] = useState("");

  const telemetryInputRef = useRef<HTMLInputElement | null>(null);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadExamples();
  }, []);

  useEffect(() => {
    if (!result) {
      setDebrief(null);
      setDebriefError("");
      setDebriefLoading(false);
      return;
    }

    generateDebrief(result);
  }, [result]);

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

  async function generateDebrief(
    assessment: TornadoAssessmentResult,
  ) {
    try {
      setDebriefLoading(true);
      setDebriefError("");
      setDebrief(null);

      const response = await fetch(
        "/api/v1/tornado/debrief",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(assessment),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData && typeof errorData.detail === "string"
            ? errorData.detail
            : "Unable to generate AI debrief.",
        );
      }

      const data: DebriefResponse = await response.json();

      setDebrief(data);
    } catch (err) {
      setDebriefError(
        err instanceof Error
          ? err.message
          : "Unable to generate AI debrief.",
      );
    } finally {
      setDebriefLoading(false);
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

  async function assessUploadedFlight() {
    if (!telemetryFile || !referenceFile || !flightId.trim()) {
      setError("Please select both CSV files and enter a flight ID.");
      return;
    }

    try {
      setAssessing(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      formData.append("telemetry_csv", telemetryFile);
      formData.append("reference_csv", referenceFile);
      formData.append("flight_id", flightId.trim());

      const response = await fetch("/api/v1/tornado/assess", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData && typeof errorData.detail === "string"
            ? errorData.detail
            : "Failed to assess uploaded flight.",
        );
      }

      const data: TornadoAssessmentResult = await response.json();

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assess uploaded flight.",
      );
    } finally {
      setAssessing(false);
    }
  }

  function formatNumber(value: number, decimals = 2) {
    return value.toFixed(decimals);
  }

  function resetAssessment() {
    setResult(null);
    setError("");
    setTelemetryFile(null);
    setReferenceFile(null);
    setFlightId("");
    setDebrief(null);
    setDebriefError("");
    setDebriefLoading(false);

    if (telemetryInputRef.current) {
      telemetryInputRef.current.value = "";
    }

    if (referenceInputRef.current) {
      referenceInputRef.current.value = "";
    }
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
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Assess Your Flight
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-white">
                    Upload autonomous flight data
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Upload telemetry and reference CSV files from an autonomous
                    flight.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
                      Flight ID
                    </label>

                    <input
                      type="text"
                      value={flightId}
                      onChange={(event) => setFlightId(event.target.value)}
                      placeholder="flight-001"
                      className="mt-2 w-full rounded-xl border border-[#252525] bg-[#151515] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-[#555555]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
                      Telemetry CSV
                    </label>

                    <input
                      ref={telemetryInputRef}
                      type="file"
                      accept=".csv"
                      onChange={(event) => {
                        const file = event.target.files
                          ? event.target.files[0]
                          : null;

                        setTelemetryFile(file);
                      }}
                      className="mt-2 block w-full cursor-pointer rounded-xl border border-[#252525] bg-[#151515] px-4 py-3 text-xs text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[#252525] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
                      Reference CSV
                    </label>

                    <input
                      ref={referenceInputRef}
                      type="file"
                      accept=".csv"
                      onChange={(event) => {
                        const file = event.target.files
                          ? event.target.files[0]
                          : null;

                        setReferenceFile(file);
                      }}
                      className="mt-2 block w-full cursor-pointer rounded-xl border border-[#252525] bg-[#151515] px-4 py-3 text-xs text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[#252525] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gray-300"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={assessUploadedFlight}
                    disabled={
                      assessing ||
                      !telemetryFile ||
                      !referenceFile ||
                      !flightId.trim()
                    }
                    className="rounded-xl bg-[#e10600] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assessing
                      ? "Assessing..."
                      : "Assess Uploaded Flight"}
                  </button>
                </div>
              </div>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#252525]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700">
                  Or
                </span>
                <div className="h-px flex-1 bg-[#252525]" />
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

          {assessing && (
            <div className="mt-6 rounded-xl border border-[#252525] bg-[#151515] p-5">
              <p className="text-sm font-medium text-gray-300">
                Processing flight telemetry...
              </p>

              <p className="mt-2 text-xs leading-5 text-gray-600">
                Calculating deterministic flight metrics and generating evidence.
              </p>
            </div>
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
                  onClick={resetAssessment}
                  className="rounded-xl border border-[#333333] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 transition-colors hover:border-[#555555] hover:text-white"
                >
                  Assess Another
                </button>
              </div>

              <section className="rounded-2xl border border-[#252525] bg-[#111111] p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Assessment Summary
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-white">
                    Flight behaviour overview
                  </h2>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
                    This flight was analyzed against its reference trajectory using
                    deterministic telemetry-based metrics and threshold-based evidence
                    detection.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <SummaryStat
                    label="Duration"
                    value={`${formatNumber(result.duration_sec)} s`}
                  />

                  <SummaryStat
                    label="Trajectory RMSE"
                    value={`${formatNumber(
                      result.metrics.trajectory_deviation.rmse_m,
                    )} m`}
                  />

                  <SummaryStat
                    label="Evidence Events"
                    value={`${result.events.length}`}
                  />
                </div>
              </section>

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
                            <p className="text-sm font-medium uppercase tracking-wide text-gray-200">
                              {event.type.replaceAll("_", " ")}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-gray-500">
                              {event.description}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e10600]">
                              {formatNumber(event.timestamp_sec)} s
                            </span>

                            <span className="text-[10px] uppercase tracking-[0.14em] text-gray-600">
                              {event.severity}
                            </span>
                          </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-[#e10600]">✦</span>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                    AI Debrief
                  </p>
                </div>

                <h2 className="mt-2 text-lg font-medium text-white">
                  Flight interpretation
                </h2>

                <p className="mt-2 max-w-3xl text-xs leading-6 text-gray-500">
                  AI-generated interpretation of the deterministic TORNADO
                  assessment. The underlying metrics and evidence remain
                  authoritative.
                </p>

                {debriefLoading && (
                  <div className="mt-6 rounded-xl border border-[#2a2020] bg-[#171111] p-5">
                    <p className="text-sm text-gray-400">
                      Generating AI debrief...
                    </p>

                    <p className="mt-2 text-xs text-gray-600">
                      Interpreting the deterministic metrics and evidence events.
                    </p>
                  </div>
                )}

                {!debriefLoading && debriefError && (
                  <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/20 p-5">
                    <p className="text-sm text-red-400">
                      AI debrief unavailable
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      The deterministic assessment is still available.
                      The AI layer could not generate its interpretation.
                    </p>

                    <p className="mt-3 text-[10px] leading-5 text-red-400/70">
                      {debriefError}
                    </p>
                  </div>
                )}

                {!debriefLoading && !debriefError && debrief && (
                  <div className="mt-6 space-y-4">

                    <div className="rounded-xl border border-[#252525] bg-[#151515] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
                        Summary
                      </p>

                      <p className="mt-3 text-sm leading-7 text-gray-300">
                        {debrief.summary}
                      </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">

                      <DebriefList
                        title="Key Findings"
                        items={debrief.key_findings}
                      />

                      <DebriefList
                        title="Areas for Review"
                        items={debrief.areas_of_concern}
                      />

                      <DebriefList
                        title="Recommendations"
                        items={debrief.recommendations}
                      />

                    </div>
                  </div>
                )}
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

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#252525] bg-[#151515] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function DebriefList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[#252525] bg-[#151515] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-xs text-gray-600">
          No additional observations.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex gap-3"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e10600]" />

              <p className="text-xs leading-5 text-gray-400">
                {item}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}