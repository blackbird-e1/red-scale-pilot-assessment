import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    messages,
    isLoading,
    activeToolCall,
    sendMessage,
    clearMessages,
  } = useChat();

  function handleToggle() {
    setIsOpen((previous) => !previous);
  }

  function handleClear() {
    clearMessages();
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-[#e10600]/40 bg-[#171111] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-red-300 shadow-2xl shadow-black/40 transition-all hover:border-[#e10600] hover:bg-[#211313]"
          aria-label="Open Red Scale Assistant"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e10600] text-white">
            ✦
          </span>

          <span>Ask Red Scale</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(680px,calc(100vh-40px))] w-[min(430px,calc(100vw-40px))] flex-col overflow-hidden rounded-3xl border border-[#303030] bg-[#0f0f0f] shadow-2xl shadow-black/60">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#292929] bg-[#131313] px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e10600] text-sm font-bold text-white">
                ✦
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Red Scale Assistant
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-gray-600">
                  Aviation & Mission Intelligence
                </p>
              </div>

            </div>

            <div className="flex items-center gap-1">

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-600 transition-colors hover:bg-[#1c1c1c] hover:text-gray-300"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={handleToggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#1c1c1c] hover:text-white"
                aria-label="Close Red Scale Assistant"
              >
                ×
              </button>

            </div>

          </div>

          {/* Conversation */}
          <div className="min-h-0 flex-1 overflow-y-auto">

            {messages.length === 0 ? (

              <div className="flex h-full flex-col justify-center px-7 py-10">

                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e10600]/20 bg-[#1a1111] text-lg text-[#e10600]">
                  ✦
                </div>

                <p className="text-lg font-semibold text-white">
                  Mission intelligence, on demand.
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Ask questions about aviation operations, flight
                  procedures, assessment concepts, or the knowledge
                  available to Red Scale.
                </p>

                <div className="mt-7 space-y-2">

                  {[
                    'What does a high descent rate indicate?',
                    'Explain the importance of bank angle.',
                    'What should a pilot monitor during descent?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      disabled={isLoading}
                      className="block w-full rounded-xl border border-[#292929] bg-[#151515] px-4 py-3 text-left text-xs text-gray-500 transition-colors hover:border-[#e10600]/30 hover:bg-[#181212] hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}

                </div>

              </div>

            ) : (

              <div className="py-4">

                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 px-5 py-4 text-xs text-gray-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e10600]" />
                    <span>
                      {activeToolCall
                        ? `Using ${activeToolCall}...`
                        : 'Red Scale is thinking...'}
                    </span>
                  </div>
                )}

              </div>

            )}

          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
          />

        </div>
      )}
    </>
  );
}