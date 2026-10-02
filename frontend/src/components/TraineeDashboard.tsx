import { useEffect, useState } from 'react';

import {
  createTrainerRequest,
  getMyTrainerRequest,
  type TrainerRequestStatus,
} from '../api/trainerRequests';

import type { AssessmentHistoryItem } from '../types';

import AssessmentHistory from './AssessmentHistory';
import AssessmentDetail from './AssessmentDetail';
import PilotDNA from './PilotDNA';

interface TraineeDashboardProps {
  username: string;
  pilotId: string;
}

export default function TraineeDashboard({
  username,
  pilotId,
}: TraineeDashboardProps) {
  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null);

  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);

  const [trainerRequestStatus, setTrainerRequestStatus] =
    useState<TrainerRequestStatus | null>(null);

  const [trainerRequestLoading, setTrainerRequestLoading] = useState(true);

  const [trainerRequestSubmitting, setTrainerRequestSubmitting] =
    useState(false);

  const [trainerRequestError, setTrainerRequestError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadTrainerRequestStatus() {
      try {
        setTrainerRequestLoading(true);

        const data = await getMyTrainerRequest();

        setTrainerRequestStatus(data.request?.status || null);
      } catch (error) {
        setTrainerRequestError(
          error instanceof Error
            ? error.message
            : 'Unable to load trainer access status.',
        );
      } finally {
        setTrainerRequestLoading(false);
      }
    }

    void loadTrainerRequestStatus();
  }, []);

  async function handleTrainerRequest() {
    try {
      setTrainerRequestSubmitting(true);
      setTrainerRequestError(null);

      const request = await createTrainerRequest();

      setTrainerRequestStatus(request.status);
    } catch (error) {
      setTrainerRequestError(
        error instanceof Error
          ? error.message
          : 'Unable to request trainer access.',
      );
    } finally {
      setTrainerRequestSubmitting(false);
    }
  }

  if (selectedAssessmentId) {
    return (
      <AssessmentDetail
        assessmentId={selectedAssessmentId}
        onBack={() => setSelectedAssessmentId(null)}
      />
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-8 sm:p-12">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
              Trainee Portal
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome, {username}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
              Review your flight assessments, performance findings, risk
              indicators, and instructor debriefs from one place.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                Assessments
              </p>

              <p className="mt-3 text-2xl font-semibold text-white">
                {assessments.length}
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Completed assessments
              </p>
            </div>

            <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                Latest Risk
              </p>

              <p className="mt-3 text-2xl font-semibold text-white">
                {assessments.length > 0 && assessments[0].risk_score != null
                  ? assessments[0].risk_score.toFixed(2)
                  : '—'}
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Latest assessment risk
              </p>
            </div>

            <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                Latest Rating
              </p>

              <p className="mt-3 text-2xl font-semibold text-white">
                {assessments.length > 0 &&
                assessments[0].overall_rating != null
                  ? assessments[0].overall_rating
                  : '—'}
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Latest assessment rating
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#252525] bg-[#161616] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                  Trainer Access
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Become a Trainer
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Request trainer access to create and manage trainee
                  assessments. An administrator must approve the request.
                </p>
              </div>

              <div className="shrink-0">
                {trainerRequestLoading ? (
                  <span className="text-sm text-gray-500">
                    Checking status...
                  </span>
                ) : trainerRequestStatus === 'pending' ? (
                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-medium text-yellow-400">
                    Request Pending
                  </span>
                ) : trainerRequestStatus === 'rejected' ? (
                  <button
                    type="button"
                    onClick={handleTrainerRequest}
                    disabled={trainerRequestSubmitting}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {trainerRequestSubmitting
                      ? 'Requesting...'
                      : 'Request Again'}
                  </button>
                ) : trainerRequestStatus === 'approved' ? (
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-medium text-green-400">
                    Approved
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleTrainerRequest}
                    disabled={trainerRequestSubmitting}
                    className="rounded-xl bg-[#e10600] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#c90500] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {trainerRequestSubmitting
                      ? 'Requesting...'
                      : 'Request Trainer Access'}
                  </button>
                )}
              </div>
            </div>

            {trainerRequestError && (
              <p className="mt-4 text-sm text-red-400">
                {trainerRequestError}
              </p>
            )}
          </div>

          {assessments.length > 0 && (
            <div className="mt-10 rounded-2xl border border-[#2b2b2b] bg-[#161616] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e10600]/30 bg-[#1a1212]">
                  <span className="h-2 w-2 rounded-full bg-[#e10600]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                    Assessment Status
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Your flight assessments are available
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    You have completed {assessments.length} flight assessment
                    {assessments.length === 1 ? '' : 's'}. Review your history
                    and Pilot DNA below.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <AssessmentHistory
              pilotId={pilotId}
              onSelectAssessment={(assessmentId) => {
                setSelectedAssessmentId(assessmentId);
              }}
              onHistoryLoaded={setAssessments}
            />
          </div>

          <div className="mt-8">
            <PilotDNA pilotId={pilotId} />
          </div>
        </section>

        <footer className="mt-10 border-t border-[#202020] pt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700">
            Red Scale · Trainee Portal
          </p>

          <p className="mt-2 text-xs text-gray-700">
            Review your flight performance and mission debriefs
          </p>
        </footer>
      </div>
    </main>
  );
}