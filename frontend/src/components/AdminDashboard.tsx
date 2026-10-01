import { useEffect, useState } from 'react';

import {
  approveTrainerRequest,
  demoteTrainer,
  getTrainerRequests,
  getTrainers,
  rejectTrainerRequest,
  type AdminTrainer,
  type AdminTrainerRequest,
} from '../api/admin';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<AdminTrainerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [processingTrainerId, setProcessingTrainerId] = useState<string | null>(
    null,
  );
  
  useEffect(() => {
    async function loadRequests() {
        try {
        setLoading(true);
        setError(null);

        const [requestsResult, trainersResult] = await Promise.all([
            getTrainerRequests(),
            getTrainers(),
        ]);

        setRequests(requestsResult);
        setTrainers(trainersResult);
        } catch (err) {
        setError(
            err instanceof Error
            ? err.message
            : 'Unable to load admin data.',
        );
        } finally {
        setLoading(false);
        }
    }

    void loadRequests();
    }, []);

  async function handleApprove(requestId: string) {
    try {
      setProcessingId(requestId);
      setError(null);

      const result = await approveTrainerRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: result.status,
                reviewed_at: new Date().toISOString(),
              }
            : request,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to approve trainer request.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId: string) {
    try {
      setProcessingId(requestId);
      setError(null);

      const result = await rejectTrainerRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: result.status,
                reviewed_at: new Date().toISOString(),
              }
            : request,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reject trainer request.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDemoteTrainer(userId: string) {
    try {
        setProcessingTrainerId(userId);
        setError(null);

        await demoteTrainer(userId);

        setTrainers((current) =>
        current.filter((trainer) => trainer.id !== userId),
        );
    } catch (err) {
        setError(
        err instanceof Error
            ? err.message
            : 'Unable to demote trainer.',
        );
    } finally {
        setProcessingTrainerId(null);
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-8 sm:p-12">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
              Manage trainer access requests and control role promotion.
            </p>
          </div>

          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                  Access Management
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Trainer Access Requests
                </h2>
              </div>

              <span className="rounded-full border border-[#2b2b2b] bg-[#161616] px-3 py-1.5 text-xs text-gray-500">
                {requests.filter((request) => request.status === 'pending').length}{' '}
                pending
              </span>
            </div>

            <div className="mt-12">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e10600]">
                        User Management
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-white">
                        Trainers
                    </h2>
                    </div>

                    <span className="rounded-full border border-[#2b2b2b] bg-[#161616] px-3 py-1.5 text-xs text-gray-500">
                    {trainers.length} trainers
                    </span>
                </div>

                {trainers.length === 0 ? (
                    <div className="rounded-2xl border border-[#252525] bg-[#161616] p-8 text-center">
                    <p className="text-sm text-gray-400">
                        No active trainers.
                    </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {trainers.map((trainer) => {
                        const isProcessing = processingTrainerId === trainer.id;

                        return (
                        <div
                            key={trainer.id}
                            className="rounded-2xl border border-[#252525] bg-[#161616] p-6"
                        >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">
                                {trainer.name}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                {trainer.email}
                                </p>

                                <p className="mt-2 font-mono text-xs text-gray-700">
                                {trainer.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDemoteTrainer(trainer.id)}
                                disabled={isProcessing}
                                className="rounded-xl border border-[#3a3a3a] px-4 py-2 text-xs font-semibold text-gray-400 transition hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isProcessing ? 'Demoting...' : 'Demote to Trainee'}
                            </button>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                )}
                </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/20 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-[#252525] bg-[#161616] p-8 text-center">
                <p className="text-sm text-gray-500">
                  Loading trainer requests...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl border border-[#252525] bg-[#161616] p-8 text-center">
                <p className="text-sm text-gray-400">
                  No trainer access requests.
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  New requests from trainees will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const isProcessing = processingId === request.id;
                  const isPending = request.status === 'pending';

                  return (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-[#252525] bg-[#161616] p-6"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                            Trainer Access Request
                          </p>

                          <p className="mt-3 font-mono text-sm text-gray-300">
                            {request.user_id}
                          </p>

                          <p className="mt-2 text-xs text-gray-600">
                            Requested{' '}
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                              request.status === 'pending'
                                ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                                : request.status === 'approved'
                                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                  : 'border-red-500/20 bg-red-500/10 text-red-400'
                            }`}
                          >
                            {request.status.toUpperCase()}
                          </span>

                          {isPending && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleReject(request.id)}
                                disabled={isProcessing}
                                className="rounded-xl border border-[#3a3a3a] px-4 py-2 text-xs font-semibold text-gray-400 transition hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isProcessing ? 'Processing...' : 'Reject'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApprove(request.id)}
                                disabled={isProcessing}
                                className="rounded-xl bg-[#e10600] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#c90500] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isProcessing ? 'Processing...' : 'Approve'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}