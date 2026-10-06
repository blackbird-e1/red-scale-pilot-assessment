import type {
  TornadoEvent,
  TornadoTrajectory,
} from "../types";

interface TornadoTrajectoryAnalysisProps {
  trajectory: TornadoTrajectory;
  events: TornadoEvent[];
}

const CHART_WIDTH = 900;
const CHART_HEIGHT = 420;
const PADDING = 50;

export default function TornadoTrajectoryAnalysis({
  trajectory,
  events,
}: TornadoTrajectoryAnalysisProps) {
  const actualPoints = trajectory.actual;
  const referencePoints = trajectory.reference;
  const deviationPoints = trajectory.deviation;

  if (
    actualPoints.length === 0 ||
    referencePoints.length === 0 ||
    deviationPoints.length === 0
  ) {
    return (
      <section className="rounded-2xl border border-[#252525] bg-[#111111] p-6">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Trajectory Analysis
          </p>

          <h2 className="mt-2 text-lg font-medium text-white">
            Flight path unavailable
          </h2>

          <p className="mt-2 text-xs leading-6 text-gray-500">
            The assessment did not return enough trajectory data to render the
            flight path analysis.
          </p>
        </div>
      </section>
    );
  }

  const allX = [
    ...actualPoints.map((point) => point.x_m),
    ...referencePoints.map((point) => point.x_m),
  ];

  const allY = [
    ...actualPoints.map((point) => point.y_m),
    ...referencePoints.map((point) => point.y_m),
  ];

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  function mapX(value: number) {
    return (
      PADDING +
      ((value - minX) / xRange) * (CHART_WIDTH - PADDING * 2)
    );
  }

  function mapY(value: number) {
    return (
      CHART_HEIGHT -
      PADDING -
      ((value - minY) / yRange) * (CHART_HEIGHT - PADDING * 2)
    );
  }

  function trajectoryPath(
    points: {
      x_m: number;
      y_m: number;
    }[],
  ) {
    return points
      .map((point, index) => {
        const x = mapX(point.x_m);
        const y = mapY(point.y_m);

        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  const actualPath = trajectoryPath(actualPoints);
  const referencePath = trajectoryPath(referencePoints);

  const deviationValues = deviationPoints.map(
    (point) => point.error_m,
  );

  const timeValues = deviationPoints.map(
    (point) => point.timestamp_sec,
  );

  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  const timeRange = maxTime - minTime || 1;

  const maxDeviation = Math.max(...deviationValues, 1);
  const deviationRange = maxDeviation || 1;

  function mapDeviationX(timestamp: number) {
    return (
      PADDING +
      ((timestamp - minTime) / timeRange) *
        (CHART_WIDTH - PADDING * 2)
    );
  }

  function mapDeviationY(error: number) {
    return (
      CHART_HEIGHT -
      PADDING -
      (error / deviationRange) *
        (CHART_HEIGHT - PADDING * 2)
    );
  }

  const deviationPath = deviationPoints
    .map((point, index) => {
      const x = mapDeviationX(point.timestamp_sec);
      const y = mapDeviationY(point.error_m);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const thresholdY = mapDeviationY(1);

  function findNearestDeviation(timestamp: number) {
    let nearest = deviationPoints[0];
    let smallestDifference = Math.abs(
      deviationPoints[0].timestamp_sec - timestamp,
    );

    for (const point of deviationPoints) {
      const difference = Math.abs(
        point.timestamp_sec - timestamp,
      );

      if (difference < smallestDifference) {
        nearest = point;
        smallestDifference = difference;
      }
    }

    return nearest;
  }

  const startPoint = actualPoints[0];
  const endPoint = actualPoints[actualPoints.length - 1];

  return (
    <section className="rounded-2xl border border-[#252525] bg-[#111111] p-6">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
          Trajectory Analysis
        </p>

        <h2 className="mt-2 text-lg font-medium text-white">
          Actual vs reference flight path
        </h2>

        <p className="mt-2 max-w-3xl text-xs leading-6 text-gray-500">
          Compare the recorded autonomous flight trajectory with the expected
          reference path and identify where deviation occurred.
        </p>
      </div>

      <div className="rounded-xl border border-[#252525] bg-[#0d0d0d] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              Flight Path
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Top-down X/Y trajectory view
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 bg-[#e10600]" />
              <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
                Actual
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 border-t border-dashed border-gray-500" />
              <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
                Reference
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="min-w-[650px] w-full"
            role="img"
            aria-label="Actual versus reference flight trajectory"
          >
            <line
              x1={PADDING}
              y1={CHART_HEIGHT - PADDING}
              x2={CHART_WIDTH - PADDING}
              y2={CHART_HEIGHT - PADDING}
              stroke="#252525"
            />

            <line
              x1={PADDING}
              y1={PADDING}
              x2={PADDING}
              y2={CHART_HEIGHT - PADDING}
              stroke="#252525"
            />

            <path
              d={referencePath}
              fill="none"
              stroke="#666666"
              strokeWidth="2"
              strokeDasharray="8 7"
            />

            <path
              d={actualPath}
              fill="none"
              stroke="#e10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx={mapX(startPoint.x_m)}
              cy={mapY(startPoint.y_m)}
              r="6"
              fill="#111111"
              stroke="#ffffff"
              strokeWidth="2"
            />

            <circle
              cx={mapX(endPoint.x_m)}
              cy={mapY(endPoint.y_m)}
              r="6"
              fill="#e10600"
              stroke="#ffffff"
              strokeWidth="2"
            />

            <text
              x={mapX(startPoint.x_m) + 10}
              y={mapY(startPoint.y_m) - 10}
              fill="#888888"
              fontSize="11"
            >
              START
            </text>

            <text
              x={mapX(endPoint.x_m) + 10}
              y={mapY(endPoint.y_m) - 10}
              fill="#e10600"
              fontSize="11"
            >
              END
            </text>
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-gray-700">
            <span>X position →</span>
            <span>Top-down X/Y view</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[#252525] bg-[#0d0d0d] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              Deviation
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Position error relative to the reference trajectory
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#e10600]" />
            <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
              Position error
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="min-w-[650px] w-full"
            role="img"
            aria-label="Trajectory deviation over time"
          >
            <line
              x1={PADDING}
              y1={CHART_HEIGHT - PADDING}
              x2={CHART_WIDTH - PADDING}
              y2={CHART_HEIGHT - PADDING}
              stroke="#252525"
            />

            <line
              x1={PADDING}
              y1={PADDING}
              x2={PADDING}
              y2={CHART_HEIGHT - PADDING}
              stroke="#252525"
            />

            <text
                x={PADDING - 10}
                y={CHART_HEIGHT - PADDING + 4}
                textAnchor="end"
                fill="#555555"
                fontSize="10"
                >
                0.0 m
                </text>

                <text
                x={PADDING - 10}
                y={mapDeviationY(1) + 4}
                textAnchor="end"
                fill="#555555"
                fontSize="10"
                >
                1.0 m
                </text>

                <text
                x={PADDING - 10}
                y={mapDeviationY(Math.min(2, maxDeviation)) + 4}
                textAnchor="end"
                fill="#555555"
                fontSize="10"
                >
                {Math.min(2, maxDeviation).toFixed(1)} m
                </text>

            {thresholdY >= PADDING &&
              thresholdY <= CHART_HEIGHT - PADDING && (
                <>
                  <line
                    x1={PADDING}
                    y1={thresholdY}
                    x2={CHART_WIDTH - PADDING}
                    y2={thresholdY}
                    stroke="#555555"
                    strokeDasharray="5 5"
                  />

                  <text
                    x={CHART_WIDTH - PADDING}
                    y={thresholdY - 7}
                    textAnchor="end"
                    fill="#666666"
                    fontSize="10"
                  >
                    1.0 m threshold
                  </text>
                </>
              )}

            <path
              d={deviationPath}
              fill="none"
              stroke="#e10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {events.map((event, index) => {
              const nearestPoint = findNearestDeviation(
                event.timestamp_sec,
              );

              const x = mapDeviationX(
                nearestPoint.timestamp_sec,
              );

              const y = mapDeviationY(
                nearestPoint.error_m,
              );

              return (
                <g key={`${event.timestamp_sec}-${index}`}>
                  <line
                    x1={x}
                    y1={PADDING}
                    x2={x}
                    y2={CHART_HEIGHT - PADDING}
                    stroke="#e10600"
                    strokeOpacity="0.25"
                    strokeDasharray="3 5"
                  />

                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="#e10600"
                    stroke="#ffffff"
                    strokeWidth="2"
                    />

                    <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fill="#e10600"
                    fontSize="10"
                    fontWeight="600"
                    >
                    {event.timestamp_sec.toFixed(1)}s
                    </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.12em] text-gray-700">
          <span>
            {minTime.toFixed(1)} s
          </span>

          <span>
            Time
          </span>

          <span>
            {maxTime.toFixed(1)} s
          </span>
        </div>
      </div>

      {events.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#252525] bg-[#151515] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
            Trajectory Events
          </p>

          <div className="mt-4 space-y-3">
            {events.map((event, index) => (
              <div
                key={`${event.timestamp_sec}-${index}`}
                className="flex flex-col gap-2 border-l border-[#e10600]/40 pl-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-300">
                    {event.type.replaceAll("_", " ")}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {event.description}
                  </p>
                </div>

                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e10600]">
                  {event.timestamp_sec.toFixed(2)} s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}