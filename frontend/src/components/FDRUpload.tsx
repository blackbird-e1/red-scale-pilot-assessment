import { useRef, useState, type ChangeEvent } from 'react';
import { assessFlight } from '../api/assessment';
import type { Assessment } from '../types';

interface FDRUploadProps {
  onAssessment: (assessment: Assessment, fileName: string) => void;
  disabled?: boolean;
}

export default function FDRUpload({
  onAssessment,
  disabled = false,
}: FDRUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    setError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV flight-data files are supported.');
      event.target.value = '';
      return;
    }

    setIsAssessing(true);

    try {
      const assessment = await assessFlight(file);
      onAssessment(assessment, file.name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete the flight assessment.',
      );
    } finally {
      setIsAssessing(false);
      event.target.value = '';
    }
  }

  function handleChooseFile() {
    if (disabled || isAssessing) {
      return;
    }

    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  const busy = disabled || isAssessing;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleChooseFile}
        disabled={busy}
        className="group w-full cursor-pointer rounded-2xl border border-[#343434] bg-[#171717] p-5 text-left transition-all duration-200 hover:border-[#e10600]/60 hover:bg-[#1a1515] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#e10600]/20 bg-[#e10600]/10 text-[#e10600]">
            {isAssessing ? (
              <svg
                className="h-6 w-6 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.2"
                />

                <path
                  d="M21 12a9 9 0 0 1-9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M5 20h14" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                {isAssessing ? 'Assessing Flight' : 'Flight Data Recorder'}
              </p>

              {!isAssessing && (
                <span className="rounded-full border border-[#2b2b2b] px-2 py-0.5 text-[9px] uppercase tracking-wider text-gray-600">
                  CSV
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {isAssessing
                ? 'Parsing telemetry · extracting features · evaluating rules'
                : 'Upload a flight-data CSV to begin assessment'}
            </p>
          </div>

          <div className="hidden flex-shrink-0 sm:block">
            <span className="rounded-lg border border-[#303030] bg-[#1b1b1b] px-4 py-2 text-xs font-medium text-gray-400 transition-colors group-hover:border-[#e10600]/50 group-hover:text-white">
              {isAssessing ? 'PROCESSING' : 'CHOOSE CSV'}
            </span>
          </div>
        </div>

        {isAssessing && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-[9px] uppercase tracking-[0.16em] text-gray-600">
              <span>Assessment pipeline</span>
              <span>Running</span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-[#252525]">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#e10600]" />
            </div>
          </div>
        )}
      </button>

      {error && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
          <span className="mt-0.5 text-red-400">!</span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
              Assessment Error
            </p>

            <p className="mt-1 text-sm text-red-400/80">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}