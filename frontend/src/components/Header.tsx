interface HeaderProps {
  onNewAssessment: () => void;
  hasAssessment: boolean;
}

export default function Header({
  onNewAssessment,
  hasAssessment,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#2e2e2e] bg-[#0f0f0f] px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-sm bg-[#e10600]" />

          <span className="text-lg font-bold tracking-tight text-white">
            Red Scale
          </span>

          <div className="h-6 w-1 rounded-sm bg-[#e10600]" />
        </div>

        <div className="hidden h-5 w-px bg-[#2e2e2e] sm:block" />

        <span className="hidden text-sm font-medium uppercase tracking-wide text-gray-400 sm:block">
          Pilot Assessment Console
        </span>
      </div>

      {hasAssessment && (
        <button
          type="button"
          onClick={onNewAssessment}
          className="cursor-pointer rounded border border-[#2e2e2e] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-[#e10600] hover:text-white"
        >
          New Assessment
        </button>
      )}
    </header>
  );
}