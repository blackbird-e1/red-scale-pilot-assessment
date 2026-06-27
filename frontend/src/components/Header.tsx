export default function Header({
  onClear,
  hasMessages,
}: {
  onClear: () => void;
  hasMessages: boolean;
}) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e] bg-[#0f0f0f]">
      <div className="flex items-center gap-3">

        {/* Red Scale Logo */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#e10600] rounded-sm" />

          <span className="text-white font-bold text-lg tracking-tight">
            Red Scale
          </span>

          <div className="w-1 h-6 bg-[#e10600] rounded-sm" />
        </div>

        <div className="h-5 w-px bg-[#2e2e2e]" />

        <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">
          Pilot Assessment Console
        </span>
      </div>

      {hasMessages && (
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-[#2e2e2e] hover:border-[#e10600] cursor-pointer"
        >
          New Assessment
        </button>
      )}
    </header>
  );
}