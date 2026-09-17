import { useEffect, useState } from 'react';
import { getAssessment } from '../api/assessment';
import type { AssessmentDetail as AssessmentDetailType } from '../types';
import AssessmentResults from './AssessmentResults';

interface AssessmentDetailProps {
  assessmentId: string;
  onBack: () => void;
}

export default function AssessmentDetail({
  assessmentId,
  onBack,
}: AssessmentDetailProps) {
  const [assessment, setAssessment] =
    useState<AssessmentDetailType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAssessment() {
      setLoading(true);
      setError('');

      try {
        const result = await getAssessment(assessmentId);

        if (!cancelled) {
          setAssessment(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load assessment.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssessment();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  if (loading) {
    return (
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="rounded-3xl border border-[#292929] bg-[#111111] p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
              Assessment
            </p>

            <h1 className="mt-3 text-2xl font-semibold text-white">
              Loading assessment...
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Retrieving the persisted flight assessment.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#e10600] hover:text-red-300"
          >
            ← Back to assessments
          </button>

          <div className="rounded-3xl border border-red-900/40 bg-[#161111] p-8">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#e10600] transition-colors hover:text-red-300"
        >
          ← Back to assessments
        </button>

        <section className="mb-6 rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
                Flight Assessment
              </p>

              <h1 className="mt-3 break-all text-2xl font-semibold text-white sm:text-3xl">
                {assessment.source_filename}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                <span>
                  Date:{' '}
                  {new Date(assessment.created_at).toLocaleDateString(
                    'en-GB',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </span>

                <span>
                  Pilot ID: {assessment.pilot_id}
                </span>

                <span>
                  Benchmark: {assessment.benchmark_id}
                </span>

                <span>
                  Version: {assessment.benchmark_version}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.18em] text-gray-600">
                  Risk
                </p>

                <p className="mt-1 text-3xl font-semibold text-white">
                  {assessment.risk_score}
                </p>
              </div>

              <div className="h-10 w-px bg-[#292929]" />

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-gray-600">
                  Rating
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {assessment.overall_rating}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AssessmentResults
          assessment={assessment}
          fileName={assessment.source_filename}
        />
      </div>
    </main>
  );
}