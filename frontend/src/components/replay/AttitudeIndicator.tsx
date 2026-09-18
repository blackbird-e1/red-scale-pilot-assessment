import type { ReplayTelemetryPoint } from '../../api/replay';

interface AttitudeIndicatorProps {
  telemetry: ReplayTelemetryPoint;
}

export default function AttitudeIndicator({
  telemetry,
}: AttitudeIndicatorProps) {
  const pitch = telemetry.pitch_deg;
  const roll = telemetry.roll_deg;

  /*
   * The visual pitch movement is intentionally limited.
   * Large real-world pitch values should not push the
   * entire indicator out of view.
   */
  const pitchOffset = Math.max(
    -35,
    Math.min(35, pitch * 2),
  );

  return (
    <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-4">

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Attitude
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Aircraft orientation
          </p>
        </div>

        <div className="font-mono text-xs text-gray-500">
          LIVE
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-full border border-[#333333] bg-[#111111]">

        {/* Artificial horizon */}
        <div
          className="absolute inset-[-35%] transition-transform duration-100"
          style={{
            transform: `
              translateY(${pitchOffset}px)
              rotate(${roll}deg)
            `,
          }}
        >
          <div className="absolute inset-0 bg-[#181818]" />

          {/* Horizon */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[#777777]" />

          {/* Pitch reference lines */}
          <div className="absolute left-1/2 top-[35%] h-px w-16 -translate-x-1/2 bg-[#555555]" />

          <div className="absolute left-1/2 top-[42%] h-px w-10 -translate-x-1/2 bg-[#555555]" />

          <div className="absolute left-1/2 top-[58%] h-px w-10 -translate-x-1/2 bg-[#555555]" />

          <div className="absolute left-1/2 top-[65%] h-px w-16 -translate-x-1/2 bg-[#555555]" />
        </div>

        {/* Fixed aircraft reference */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">

          <div className="relative h-2 w-32">

            <div className="absolute left-0 top-1/2 h-1 w-12 -translate-y-1/2 rounded-full bg-white" />

            <div className="absolute right-0 top-1/2 h-1 w-12 -translate-y-1/2 rounded-full bg-white" />

            <div className="absolute left-1/2 top-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />

          </div>

        </div>

        {/* Center marker */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />

        {/* Pitch value */}
        <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 font-mono text-[10px] text-gray-500">
          {pitch > 0 ? '+' : ''}
          {pitch.toFixed(1)}°
        </div>

        {/* Roll value */}
        <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2 font-mono text-[10px] text-gray-500">
          {roll > 0 ? '+' : ''}
          {roll.toFixed(1)}°
        </div>

        {/* Top label */}
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          PITCH
        </div>

        {/* Bottom label */}
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          ROLL
        </div>

      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">

        <div className="rounded-xl border border-[#292929] bg-[#151515] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-gray-600">
            Pitch
          </p>

          <p className="mt-1 font-mono text-lg text-white">
            {pitch.toFixed(1)}
            <span className="ml-1 text-xs text-gray-600">
              °
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-[#292929] bg-[#151515] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-gray-600">
            Roll
          </p>

          <p className="mt-1 font-mono text-lg text-white">
            {roll.toFixed(1)}
            <span className="ml-1 text-xs text-gray-600">
              °
            </span>
          </p>
        </div>

      </div>

    </div>
  );
}