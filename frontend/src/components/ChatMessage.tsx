import type { Message } from '../types';

const TOOL_LABELS: Record<string, string> = {
  aviation_knowledge: 'Searching aviation knowledge',
  f1_knowledge: 'Searching aviation knowledge',
};

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[#e10600] px-4 py-3 text-sm leading-relaxed text-white shadow-lg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* Red Scale assistant icon */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#e10600] shadow-md">
        <span className="text-xs font-bold leading-none text-white">
          RS
        </span>
      </div>

      <div className="flex max-w-[80%] flex-col gap-2">
        {/* Assistant message */}
        <div
          className={[
            'rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed',
            message.error
              ? 'border border-red-800/50 bg-red-950/40 text-red-300'
              : 'border border-[#2e2e2e] bg-[#1e1e1e] text-gray-200',
          ].join(' ')}
        >
          {message.content.split('\n').map((line, index, lines) => (
            <span key={index}>
              {line}

              {index < lines.length - 1 && <br />}
            </span>
          ))}

          {message.streaming && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 align-middle bg-gray-400 animate-pulse" />
          )}
        </div>

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.toolCalls.map((tool, index) => (
              <span
                key={`${tool}-${index}`}
                className="inline-flex items-center gap-1 rounded-full border border-[#2e2e2e] bg-[#1a1a1a] px-2 py-0.5 text-[10px] font-medium text-gray-500"
              >
                <span className="h-1 w-1 rounded-full bg-[#e10600]" />

                {TOOL_LABELS[tool] || tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}