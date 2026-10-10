
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPilotAssessmentHistory } from '../api/assessment';
import type { Trainee } from '../api/auth';
import type { AssessmentHistoryItem } from '../types';
import AssessmentDetail from './AssessmentDetail';

interface TrainerAssessment extends AssessmentHistoryItem {
  pilotId: string;
  pilotName: string;
  pilotEmail: string;
}

interface TrainerAssessmentOverviewProps {
  trainees: Trainee[];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function TrainerAssessmentOverview({
  trainees,
}: TrainerAssessmentOverviewProps) {
  const [assessments, setAssessments] = useState<TrainerAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadAssessments = useCallback(async () => {
    if (trainees.length === 0) {
      setAssessments([]);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const histories = await Promise.all(
        trainees.map(async (trainee) => {
          const history = await getPilotAssessmentHistory(trainee.id);
          return history.map((item) => ({
            ...item,
            pilotId: trainee.id,
            pilotName: trainee.name,
            pilotEmail: trainee.email,
          }));
        }),
      );

      setAssessments(
        histories.flat().sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load trainee assessment records.',
      );
    } finally {
      setLoading(false);
    }
  }, [trainees]);

  useEffect(() => {
    void loadAssessments();
  }, [loadAssessments, refreshKey]);

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assessments;

    return assessments.filter((item) =>
      [
        item.source_filename,
        item.pilotName,
        item.pilotEmail,
        item.overall_rating ?? '',
        item.benchmark_id,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [assessments, search]);

  if (selectedAssessmentId) {
    return (
      <AssessmentDetail
        assessmentId={selectedAssessmentId}
        onBack={() => setSelectedAssessmentId(null)}
      />
    );
  }

  return (
    <section className="mt-6 rounded-3xl border border-[#2b2b2b] bg-[#111111] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
            Training Records
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Assessment Overview
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Review assessments across your trainees, newest first.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
          className="rounded-xl border border-[#303030] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-[#e10600]/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#252525] bg-[#161616] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            Trainees
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {trainees.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#252525] bg-[#161616] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            Assessments
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {assessments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#252525] bg-[#161616] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            Visible Results
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {filteredAssessments.length}
          </p>
        </div>
      </div>

      {!loading && !error && assessments.length > 0 && (
        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-medium text-gray-400">
            Search assessments
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pilot, filename, rating, or benchmark…"
            className="w-full rounded-xl border border-[#303030] bg-[#0c0c0c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#e10600]/60"
          />
        </label>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-[#252525] bg-[#161616] p-8 text-center">
          <p className="text-sm text-gray-400">
            Loading trainee assessment history…
          </p>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-900/40 bg-[#1a1111] p-6">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-4 rounded-lg border border-red-900/50 px-4 py-2 text-sm text-red-200 hover:bg-red-950/40"
          >
            Try again
          </button>
        </div>
      ) : trainees.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#252525] bg-[#161616] p-8">
          <h3 className="font-semibold text-white">No trainees available</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Check that the backend is running and your trainer account can access trainees.
          </p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#252525] bg-[#161616] p-8">
          <h3 className="font-semibold text-white">No assessments yet</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Completed assessments for your trainees will appear here.
          </p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#252525] bg-[#161616] p-8 text-center">
          <p className="text-sm text-gray-400">
            No assessments match “{search}”.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredAssessments.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#292929] bg-[#161616] p-5 transition hover:border-[#e10600]/35 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-semibold text-white">
                    {item.source_filename}
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">{item.pilotName}</p>
                  <p className="mt-1 text-xs text-gray-600">{item.pilotEmail}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatDate(item.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#e10600]/30 bg-[#1a1212] px-3 py-1 text-xs font-semibold text-red-300">
                    {item.overall_rating ?? 'Not scored'}
                  </span>
                  <span className="rounded-full border border-[#303030] px-3 py-1 text-xs text-gray-400">
                    Risk {item.risk_score ?? '—'}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#252525] pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600">
                    Duration
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {formatDuration(item.duration_sec)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600">
                    Max Speed
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {Math.round(item.max_speed_knots)} kt
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600">
                    Max Bank
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {Math.round(item.max_bank_angle_deg)}°
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600">
                    Max Descent
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {Math.round(item.max_descent_rate_fpm)} fpm
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#252525] pt-4">
                <p className="text-xs text-gray-600">
                  {item.benchmark_id} · v{item.benchmark_version}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAssessmentId(item.id)}
                  className="rounded-lg border border-[#e10600]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-300 transition hover:bg-[#e10600]/10"
                >
                  View Assessment →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
