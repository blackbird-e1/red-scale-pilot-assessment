const SUGGESTIONS = [
  "Assess uploaded mission",
  "Generate pilot debrief report",
  "Identify SOP violations",
  "Recommend personalized training",
];

const FEATURES = [
  "Flight Data Analysis",
  "SOP Compliance",
  "Mission Debrief",
  "Training Recommendations",
];

const INPUTS = [
  "Flight Data Recorder (CSV)",
  "Mission Log",
  "Flight Procedures / SOP",
  "Training Manual",
];

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

export default function WelcomeScreen({
  onSuggestion,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">

      {/* Brand */}
      <div className="mb-10">

        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-1.5 h-10 bg-[#e10600] rounded-sm" />
          <span className="text-white font-bold text-5xl tracking-tight">
            Red Scale
          </span>
          <div className="w-1.5 h-10 bg-[#e10600] rounded-sm" />
        </div>

        <h1 className="text-3xl font-semibold text-white mb-3">
          AI Pilot Debrief & Assessment System
        </h1>

        <p className="text-gray-400 text-sm leading-7 max-w-2xl mx-auto">
          Analyze Flight Data Recorder logs, compare pilot performance against
          operational procedures, detect policy violations and generate
          objective mission debriefs with personalized training recommendations.
        </p>

      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl">
        {FEATURES.map((feature) => (
          <div
            key={feature}
            className="px-4 py-2 rounded-full border border-[#e10600]/40 text-red-300 text-xs transition-all duration-200 hover:bg-[#e10600] hover:text-white hover:border-[#e10600]"
          >
            {feature}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left px-5 py-4 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl text-gray-300 hover:text-white hover:border-[#e10600] hover:bg-[#222222] transition-all duration-200 cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Supported Inputs */}
      <div className="w-full max-w-2xl">

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#2e2e2e]" />
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
            Supported Inputs
          </span>
          <div className="flex-1 h-px bg-[#2e2e2e]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {INPUTS.map((input) => (
            <div
              key={input}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#171717] border border-[#2e2e2e] hover:border-[#e10600] hover:bg-[#1d1d1d] transition-all duration-200"
            >
              <span className="text-[#e10600] font-bold">
                ✓
              </span>

              <span className="text-gray-300 text-sm">
                {input}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* Workflow */}
      {/* Supported Inputs */}
      <div className="w-full max-w-2xl mb-8">

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#2e2e2e]" />
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
            Workflow
          </span>
          <div className="flex-1 h-px bg-[#2e2e2e]" />
        </div>

        <div className="bg-[#171717] border border-[#2e2e2e] rounded-2xl p-8 hover:border-[#e10600] transition-all duration-300">

          <div className="flex flex-col items-center">

            <span className="text-gray-300 text-sm font-medium">
              Flight Data Recorder
            </span>

            <div className="w-px h-6 bg-[#444]" />
            <div className="w-3 h-3 rounded-full bg-[#e10600]" />
            <div className="w-px h-6 bg-[#444]" />

            <span className="text-gray-300 text-sm font-medium">
              Mission Logs
            </span>

            <div className="w-px h-6 bg-[#444]" />
            <div className="w-3 h-3 rounded-full bg-[#e10600]" />
            <div className="w-px h-6 bg-[#444]" />

            <div className="w-full max-w-sm rounded-xl border border-[#e10600] bg-[#1d1d1d] p-6 shadow-lg shadow-red-900/20">

              <h2 className="text-white font-bold text-xl">
                Red Scale
              </h2>

              <p className="text-gray-400 text-sm mt-2">
                Machine Learning • Retrieval-Augmented Generation
              </p>

            </div>
            <div className="w-px h-6 bg-[#444]" />
            <div className="w-3 h-3 rounded-full bg-[#e10600]" />
            <div className="w-px h-6 bg-[#444]" />

            <div className="grid grid-cols-2 gap-3 w-full mt-5">

              {[
                "Mission Debrief",
                "Pilot Assessment",
                "SOP Violations",
                "Training Plan",
              ].map((item) => (
                <div
                  key={item}
                  className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-lg p-3 text-sm text-gray-300 hover:border-[#e10600] transition-all"
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}