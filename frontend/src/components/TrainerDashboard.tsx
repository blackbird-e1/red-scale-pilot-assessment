import { useState } from 'react';
import FDRUpload from './FDRUpload';
import AssessmentResults from './AssessmentResults';
import type { Assessment } from '../types';
import type { Trainee } from '../api/auth';

interface TrainerDashboardProps {
  trainees: Trainee[];
}

export default function TrainerDashboard({
  trainees,
}: TrainerDashboardProps) {
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [fileName, setFileName] = useState('');
  const [, setSelectedTraineeId] = useState('');

  function handleAssessment(result: Assessment, name: string) {
    setAssessment(result);
    setFileName(name);
  }

  function handleNewAssessment() {
    setAssessment(null);
    setFileName('');
    setSelectedTraineeId('');
    setShowNewAssessment(true);
  }

  if (assessment) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <button
            type="button"
            onClick={handleNewAssessment}
            className="mb-6 text-xs font-semibold uppercase tracking-wider text-[#e10600] hover:text-red-300"
          >
            ← New Assessment
          </button>

          <AssessmentResults
            assessment={assessment}
            fileName={fileName}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <section className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
            Trainer Console
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-white">
            Trainer Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Create flight assessments and manage trainee performance records.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={handleNewAssessment}
              className="rounded-xl bg-[#e10600] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c90500]"
            >
              + New Assessment
            </button>

            <button
              type="button"
              onClick={() => setShowNewAssessment(false)}
              className="rounded-xl border border-[#303030] px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-[#e10600]/50"
            >
              Dashboard Overview
            </button>
          </div>
        </section>

        {showNewAssessment && (
          <section className="mt-6 rounded-3xl border border-[#2b2b2b] bg-[#111111] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  New Assessment
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Upload flight data and select the trainee being assessed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewAssessment(false)}
                className="text-sm text-gray-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <FDRUpload
              onAssessment={handleAssessment}
              trainees={trainees}
              onTraineeChange={setSelectedTraineeId}
            />
          </section>
        )}
      </div>
    </main>
  );
}