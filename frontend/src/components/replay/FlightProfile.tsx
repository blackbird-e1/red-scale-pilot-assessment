import type { ReplayTelemetryPoint } from '../../api/replay';

interface FlightProfileProps {
  telemetry: ReplayTelemetryPoint[];
  currentTime: number;
}

const WIDTH = 1000;
const HEIGHT = 300;

const PADDING_LEFT = 58;
const PADDING_RIGHT = 20;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 42;

function formatTime(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

function niceAltitude(value: number): number {
  if (value <= 0) {
    return 1000;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  let nice = 1;

  if (normalized <= 1) {
    nice = 1;
  } else if (normalized <= 2) {
    nice = 2;
  } else if (normalized <= 5) {
    nice = 5;
  } else {
    nice = 10;
  }

  return nice * magnitude;
}

export default function FlightProfile({
  telemetry,
  currentTime,
}: FlightProfileProps) {
  if (telemetry.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[#292929] bg-[#0b0b0b]">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
          No telemetry available
        </p>
      </div>
    );
  }

  const maxAltitude = Math.max(
    ...telemetry.map((point) => point.altitude_ft),
  );

  const chartMaxAltitude = niceAltitude(maxAltitude);

  const minTime = telemetry[0].timestamp_sec;
  const maxTime =
    telemetry[telemetry.length - 1].timestamp_sec;

  const chartWidth =
    WIDTH - PADDING_LEFT - PADDING_RIGHT;

  const chartHeight =
    HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function xForTime(time: number): number {
    if (maxTime === minTime) {
      return PADDING_LEFT;
    }

    const normalized =
      (time - minTime) / (maxTime - minTime);

    return (
      PADDING_LEFT +
      normalized * chartWidth
    );
  }

  function yForAltitude(altitude: number): number {
    const normalized =
      altitude / chartMaxAltitude;

    return (
      PADDING_TOP +
      (1 - normalized) * chartHeight
    );
  }

  const linePoints = telemetry
    .map((point) => {
      const x = xForTime(point.timestamp_sec);
      const y = yForAltitude(point.altitude_ft);

      return `${x},${y}`;
    })
    .join(' ');

  const currentX = xForTime(currentTime);

  let currentAltitude = telemetry[0].altitude_ft;

  for (let index = 0; index < telemetry.length - 1; index += 1) {
    const current = telemetry[index];
    const next = telemetry[index + 1];

    if (
      currentTime >= current.timestamp_sec &&
      currentTime <= next.timestamp_sec
    ) {
      const duration =
        next.timestamp_sec -
        current.timestamp_sec;

      const factor =
        duration === 0
          ? 0
          : (currentTime - current.timestamp_sec) /
            duration;

      currentAltitude =
        current.altitude_ft +
        (next.altitude_ft -
          current.altitude_ft) *
          factor;

      break;
    }

    if (currentTime >= next.timestamp_sec) {
      currentAltitude = next.altitude_ft;
    }
  }

  const currentY = yForAltitude(currentAltitude);

  const altitudeSteps = 5;

  const gridLines = Array.from(
    { length: altitudeSteps + 1 },
    (_, index) => {
      const altitude =
        (chartMaxAltitude / altitudeSteps) *
        index;

      const y = yForAltitude(altitude);

      return {
        altitude,
        y,
      };
    },
  );

  const timeLabels = Array.from(
    { length: 5 },
    (_, index) => {
      const time =
        minTime +
        ((maxTime - minTime) / 4) * index;

      return {
        time,
        x: xForTime(time),
      };
    },
  );

  return (
    <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-4">

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Flight Profile
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Altitude over time
          </p>
        </div>

        <div className="font-mono text-xs text-gray-500">
          {Math.round(currentAltitude).toLocaleString()} FT
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Flight altitude profile"
        >
          {/* Background */}
          <rect
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
            fill="#0b0b0b"
          />

          {/* Horizontal grid */}
          {gridLines.map((line) => (
            <g key={line.altitude}>
              <line
                x1={PADDING_LEFT}
                y1={line.y}
                x2={WIDTH - PADDING_RIGHT}
                y2={line.y}
                stroke="#222222"
                strokeWidth="1"
              />

              <text
                x={PADDING_LEFT - 10}
                y={line.y + 4}
                textAnchor="end"
                fill="#555555"
                fontSize="11"
                fontFamily="monospace"
              >
                {Math.round(line.altitude).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Vertical time guides */}
          {timeLabels.map((label) => (
            <line
              key={label.time}
              x1={label.x}
              y1={PADDING_TOP}
              x2={label.x}
              y2={HEIGHT - PADDING_BOTTOM}
              stroke="#171717"
              strokeWidth="1"
            />
          ))}

          {/* Flight path */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#e10600"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Telemetry points */}
          {telemetry.map((point) => (
            <circle
              key={point.timestamp_sec}
              cx={xForTime(point.timestamp_sec)}
              cy={yForAltitude(point.altitude_ft)}
              r="3"
              fill="#e10600"
            />
          ))}

          {/* Current replay position */}
          <line
            x1={currentX}
            y1={PADDING_TOP}
            x2={currentX}
            y2={HEIGHT - PADDING_BOTTOM}
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity="0.7"
          />

          {/* Current point */}
          <circle
            cx={currentX}
            cy={currentY}
            r="8"
            fill="#ffffff"
          />

          <circle
            cx={currentX}
            cy={currentY}
            r="4"
            fill="#e10600"
          />

          {/* Aircraft */}
          <text
            x={currentX}
            y={currentY - 14}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
          >
            ✈
          </text>

          {/* X-axis */}
          <line
            x1={PADDING_LEFT}
            y1={HEIGHT - PADDING_BOTTOM}
            x2={WIDTH - PADDING_RIGHT}
            y2={HEIGHT - PADDING_BOTTOM}
            stroke="#333333"
            strokeWidth="1"
          />

          {/* Time labels */}
          {timeLabels.map((label) => (
            <text
              key={`label-${label.time}`}
              x={label.x}
              y={HEIGHT - 15}
              textAnchor="middle"
              fill="#555555"
              fontSize="10"
              fontFamily="monospace"
            >
              {formatTime(label.time)}
            </text>
          ))}

          {/* Y-axis label */}
          <text
            x="14"
            y={PADDING_TOP}
            fill="#555555"
            fontSize="9"
            fontFamily="monospace"
            transform={`rotate(-90 14 ${PADDING_TOP})`}
          >
            ALTITUDE FT
          </text>
        </svg>
      </div>

    </div>
  );
}