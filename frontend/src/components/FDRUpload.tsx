import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
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
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCsvChange(event: ChangeEvent<HTMLInputElement>) {
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

    setCsvFile(file);
    event.target.value = '';
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    setError(null);

    const allowedTypes = [
      'image/png',
      'image/jpeg',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only PNG and JPG/JPEG images are supported.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 10 MB.');
      event.target.value = '';
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    event.target.value = '';
  }

  function handleRemoveImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
  }

  async function handleAssessment() {
    if (!csvFile) {
      setError('Please select a flight-data CSV first.');
      return;
    }

    setError(null);
    setIsAssessing(true);

    try {
      const assessment = await assessFlight(
        csvFile,
        imageFile || undefined,
      );

      onAssessment(assessment, csvFile.name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete the flight assessment.',
      );
    } finally {
      setIsAssessing(false);
    }
  }

  function handleChooseCsv() {
    if (disabled || isAssessing) {
      return;
    }

    if (csvInputRef.current) {
      csvInputRef.current.click();
    }
  }

  function handleChooseImage() {
    if (disabled || isAssessing) {
      return;
    }

    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  }

  const busy = disabled || isAssessing;

  return (
    <div>
      {/* Hidden file inputs */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleCsvChange}
        className="hidden"
      />

      <input
        ref={imageInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* CSV upload */}
      <button
        type="button"
        onClick={handleChooseCsv}
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
                {isAssessing
                  ? 'Assessing Flight'
                  : csvFile
                    ? 'Flight Data Selected'
                    : 'Flight Data Recorder'}
              </p>

              <span className="rounded-full border border-[#2b2b2b] px-2 py-0.5 text-[9px] uppercase tracking-wider text-gray-600">
                CSV
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-gray-500">
              {isAssessing
                ? 'Parsing telemetry · analyzing evidence · evaluating rules'
                : csvFile
                  ? csvFile.name
                  : 'Upload a flight-data CSV to begin assessment'}
            </p>
          </div>

          <div className="hidden flex-shrink-0 sm:block">
            <span className="rounded-lg border border-[#303030] bg-[#1b1b1b] px-4 py-2 text-xs font-medium text-gray-400 transition-colors group-hover:border-[#e10600]/50 group-hover:text-white">
              {csvFile ? 'CHANGE CSV' : 'CHOOSE CSV'}
            </span>
          </div>
        </div>
      </button>

      {/* Visual evidence */}
      <div className="mt-4 rounded-2xl border border-[#292929] bg-[#131313] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                Visual Evidence
              </p>

              <span className="rounded-full border border-[#e10600]/20 bg-[#e10600]/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#e10600]">
                Optional
              </span>
            </div>

            <p className="mt-1 text-sm leading-5 text-gray-600">
              Upload a cockpit or flight image for visual analysis.
            </p>
          </div>

          {!imageFile && (
            <button
              type="button"
              onClick={handleChooseImage}
              disabled={busy}
              className="flex-shrink-0 rounded-lg border border-[#303030] bg-[#1b1b1b] px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-[#e10600]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              ADD IMAGE
            </button>
          )}
        </div>

        {imageFile && imagePreview && (
          <div className="mt-4 overflow-hidden rounded-xl border border-[#292929] bg-[#0d0d0d]">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected visual evidence"
                className="max-h-64 w-full object-contain"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={busy}
                className="absolute right-3 top-3 rounded-lg border border-[#444] bg-black/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-300 hover:border-red-500/50 hover:text-red-300 disabled:opacity-50"
              >
                Remove
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#292929] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-300">
                  {imageFile.name}
                </p>

                <p className="mt-1 text-[10px] text-gray-600">
                  {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <span className="flex-shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-400">
                Ready
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Run assessment */}
      <button
        type="button"
        onClick={handleAssessment}
        disabled={busy || !csvFile}
        className="mt-4 w-full rounded-2xl border border-[#e10600]/40 bg-[#e10600]/10 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all hover:border-[#e10600] hover:bg-[#e10600]/20 disabled:cursor-not-allowed disabled:border-[#292929] disabled:bg-[#151515] disabled:text-gray-600"
      >
        {isAssessing
          ? 'Running Assessment...'
          : imageFile
            ? 'Run Assessment + Visual Analysis'
            : 'Run Flight Assessment'}
      </button>

      {/* Progress */}
      {isAssessing && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-[9px] uppercase tracking-[0.16em] text-gray-600">
            <span>Assessment pipeline</span>
            <span>Running</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-[#252525]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#e10600]" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
          <span className="mt-0.5 text-red-400">!</span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
              Assessment Error
            </p>

            <p className="mt-1 text-sm text-red-400/80">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
