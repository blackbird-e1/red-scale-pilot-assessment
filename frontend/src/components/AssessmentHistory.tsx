import { useEffect, useState } from 'react';
import { getPilotAssessmentHistory } from '../api/assessment';
import type { AssessmentHistoryItem } from '../types';

interface AssessmentHistoryProps {
  pilotId: string;
  onSelectAssessment: (assessmentId: string) => void;
  onHistoryLoaded?: (assessments: AssessmentHistoryItem[]) => void;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AssessmentHistory({
  pilotId,
  onSelectAssessment,
  onHistoryLoaded,
}: AssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError('');

      try {
        const history = await getPilotAssessmentHistory(pilotId);
        setAssessments(history);
        onHistoryLoaded?.(history);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load assessment history',
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [pilotId, onHistoryLoaded]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#2b2b2b] bg-[#161616] p-8 text-center">
        <p className="text-sm text-gray-500">
          Loading assessment history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-[#1a1111] p-6">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2b2b2b] bg-[#161616] p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
          Assessment Status
        </p>

        <h2 className="mt-2 text-lg font-semibold text-white">
          No assessments available
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Your completed flight assessments will appear here.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
          Flight History
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          My Assessments
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Review your previous flight assessments and performance findings.
        </p>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <button
            key={assessment.id}
            type="button"
            onClick={() => onSelectAssessment(assessment.id)}
            className="w-full rounded-2xl border border-[#2b2b2b] bg-[#161616] p-5 text-left transition hover:border-[#e10600]/40 hover:bg-[#181414] sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {assessment.source_filename}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {formatDate(assessment.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-[#e10600]/30 bg-[#1a1212] px-3 py-1 text-xs font-semibold text-red-300">
                  {assessment.overall_rating}
                </span>

                <span className="text-xs text-gray-500">
                  Risk {assessment.risk_score}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600">
                  Duration
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  {formatDuration(assessment.duration_sec)}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600">
                  Max Speed
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  {Math.round(assessment.max_speed_knots)} kt
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600">
                  Max Bank
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  {Math.round(assessment.max_bank_angle_deg)}°
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600">
                  Max Descent
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  {Math.round(assessment.max_descent_rate_fpm)} fpm
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-[#252525] pt-4">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e10600]">
                View Assessment →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}