import type { TelemetryPoint } from '../types';

interface FlightChartsProps {
  telemetry: TelemetryPoint[];
}

interface LineChartProps {
  title: string;
  subtitle: string;
  points: Array<{ x: number; y: number }>;
  unit: string;
  lineClass: string;
  formatValue?: (value: number) => string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);

  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

function LineChart({
  title,
  subtitle,
  points,
  unit,
  lineClass,
  formatValue = (value) => value.toFixed(0),
}: LineChartProps) {
  const width = 900;
  const height = 260;

  const paddingLeft = 62;
  const paddingRight = 20;
  const paddingTop = 35;
  const paddingBottom = 42;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (points.length < 2) {
    return (
      <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-gray-600">{subtitle}</p>

        <div className="flex h-48 items-center justify-center text-xs text-gray-600">
          Insufficient telemetry data
        </div>
      </div>
    );
  }

  const rawMin = Math.min(...points.map((point) => point.y));
  const rawMax = Math.max(...points.map((point) => point.y));

  const range = rawMax - rawMin;

  const margin = range === 0 ? Math.max(Math.abs(rawMax) * 0.1, 1) : range * 0.08;

  const minY = rawMin - margin;
  const maxY = rawMax + margin;

  const minX = points[0].x;
  const maxX = points[points.length - 1].x;

  function scaleX(value: number): number {
    if (maxX === minX) {
      return paddingLeft;
    }

    return (
      paddingLeft +
      ((value - minX) / (maxX - minX)) * chartWidth
    );
  }

  function scaleY(value: number): number {
    if (maxY === minY) {
      return paddingTop + chartHeight / 2;
    }

    return (
      paddingTop +
      chartHeight -
      ((value - minY) / (maxY - minY)) * chartHeight
    );
  }

  const path = points
    .map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);

      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    return minY + ((maxY - minY) * index) / 4;
  }).reverse();

  const xTicks = Array.from({ length: 5 }, (_, index) => {
    return minX + ((maxX - minX) * index) / 4;
  });

  return (
    <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-gray-600">{subtitle}</p>
        </div>

        <span className="rounded-full border border-[#292929] bg-[#161616] px-2.5 py-1 text-[9px] uppercase tracking-wider text-gray-600">
          {unit}
        </span>
      </div>

      <div className="mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${title} chart`}
        >
          {/* Horizontal grid */}
          {yTicks.map((tick, index) => {
            const y = scaleY(tick);

            return (
              <g key={`y-${index}`}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={y}
                  y2={y}
                  stroke="#252525"
                  strokeWidth="1"
                />

                <text
                  x={paddingLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#555"
                  fontSize="10"
                >
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Vertical grid */}
          {xTicks.map((tick, index) => {
            const x = scaleX(tick);

            return (
              <g key={`x-${index}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={paddingTop}
                  y2={paddingTop + chartHeight}
                  stroke="#1e1e1e"
                  strokeWidth="1"
                />

                <text
                  x={x}
                  y={height - 16}
                  textAnchor="middle"
                  fill="#555"
                  fontSize="10"
                >
                  {formatTime(tick)}
                </text>
              </g>
            );
          })}

          {/* Axis */}
          <line
            x1={paddingLeft}
            x2={paddingLeft}
            y1={paddingTop}
            y2={paddingTop + chartHeight}
            stroke="#333"
          />

          <line
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={paddingTop + chartHeight}
            y2={paddingTop + chartHeight}
            stroke="#333"
          />

          {/* Data line */}
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            className={lineClass}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Start marker */}
          <circle
            cx={scaleX(points[0].x)}
            cy={scaleY(points[0].y)}
            r="3"
            fill="currentColor"
            className={lineClass}
          />

          {/* End marker */}
          <circle
            cx={scaleX(points[points.length - 1].x)}
            cy={scaleY(points[points.length - 1].y)}
            r="3"
            fill="currentColor"
            className={lineClass}
          />
        </svg>
      </div>

      <div className="flex justify-between border-t border-[#202020] pt-3 text-[9px] uppercase tracking-wider text-gray-700">
        <span>Start {formatTime(minX)}</span>
        <span>End {formatTime(maxX)}</span>
      </div>
    </div>
  );
}

export default function FlightCharts({
  telemetry,
}: FlightChartsProps) {
  if (!telemetry || telemetry.length < 2) {
    return (
      <section className="mt-6 rounded-2xl border border-[#292929] bg-[#111111] p-6">
        <p className="text-sm text-gray-500">
          Flight telemetry visualization is unavailable for this assessment.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
            Flight Profile
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Telemetry over time
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Visual representation of the recorded flight profile.
          </p>
        </div>

        <span className="hidden text-[9px] uppercase tracking-[0.2em] text-gray-700 sm:block">
          {telemetry.length} samples
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart
          title="Altitude Profile"
          subtitle="Aircraft altitude throughout the flight"
          unit="FT"
          lineClass="text-red-500"
          points={telemetry.map((point) => ({
            x: point.timestamp_sec,
            y: point.altitude_ft,
          }))}
          formatValue={(value) =>
            Math.round(value).toLocaleString()
          }
        />

        <LineChart
          title="Airspeed Profile"
          subtitle="Indicated airspeed throughout the flight"
          unit="KNOTS"
          lineClass="text-orange-400"
          points={telemetry.map((point) => ({
            x: point.timestamp_sec,
            y: point.indicated_airspeed_knots,
          }))}
          formatValue={(value) => value.toFixed(0)}
        />

        <LineChart
          title="Pitch Profile"
          subtitle="Aircraft pitch attitude throughout the flight"
          unit="DEGREES"
          lineClass="text-emerald-400"
          points={telemetry.map((point) => ({
            x: point.timestamp_sec,
            y: point.pitch_deg,
          }))}
          formatValue={(value) => value.toFixed(1)}
        />

        <LineChart
          title="Roll / Bank Profile"
          subtitle="Lateral attitude throughout the flight"
          unit="DEGREES"
          lineClass="text-sky-400"
          points={telemetry.map((point) => ({
            x: point.timestamp_sec,
            y: point.bank_angle_deg,
          }))}
          formatValue={(value) => value.toFixed(1)}
        />
      </div>
    </section>
  );
}