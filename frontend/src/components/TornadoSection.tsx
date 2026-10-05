import { useState } from "react";

interface TornadoSectionProps {
  onOpen: () => void;
}

export default function TornadoSection({
  onOpen,
}: TornadoSectionProps) {
  const [expanded, setExpanded] = useState(false);

return (
  <section className="border-t border-[#202020] py-6 sm:py-8">
    <div className="mx-auto max-w-4xl rounded-3xl border border-[#252525] bg-[#0f0f0f] px-7 py-7 sm:px-10">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#e10600]">
              Tornado
            </p>

            <h2 className="mt-2 text-xl font-semibold text-gray-200">
              Autonomous Flight Assessment
            </h2>
          </div>

          <span className="text-lg text-gray-500">
            {expanded ? '⌃' : '⌄'}
          </span>
        </button>

        {expanded && (
          <div className="mt-5 border-t border-[#202020] pt-5">
            <p className="max-w-xl text-sm leading-6 text-gray-600">
              Evaluate recorded autonomous drone flight telemetry for
              trajectory, stability, attitude, and control behaviour.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={onOpen}
                className="rounded-xl border border-[#333333] bg-[#161616] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 transition-colors hover:border-[#e10600]/60 hover:bg-[#1b1111] hover:text-red-300"
              >
                Try Tornado
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}