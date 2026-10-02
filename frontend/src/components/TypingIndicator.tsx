const TOOL_LABELS: Record<string, string> = {
  get_assessment: 'Retrieving assessment',
  get_my_assessment_history: 'Retrieving assessment history',
  get_my_pilot_dna: 'Analyzing Pilot DNA',
  get_replay_evidence: 'Retrieving replay evidence',
  get_similar_flights: 'Finding similar flights',
};

interface TypingIndicatorProps {
  toolName?: string | null;
}

export default function TypingIndicator({ toolName }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#e10600] flex items-center justify-center">
        <span className="text-white text-xs font-bold">RS</span>
      </div>

      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl rounded-tl-sm px-4 py-3">
        {toolName ? (
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
            {TOOL_LABELS[toolName] ?? `${toolName}…`}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 h-4">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  );
}