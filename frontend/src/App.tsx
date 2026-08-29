import { useState } from 'react';
import Header from './components/Header';
import FDRUpload from './components/FDRUpload';
import AssessmentResults from './components/AssessmentResults';
import type { Assessment } from './types';
import ChatAssistant from './components/ChatAssistant';
import Login from './components/Login';
import type { LoginResponse } from './api/auth';
import TraineeDashboard from './components/TraineeDashboard';

const CAPABILITIES = [
  {
    title: 'Flight Data Analysis',
    description: 'Extract performance characteristics from FDR data.',
    icon: '01',
  },
  {
    title: 'SOP Compliance',
    description: 'Evaluate flight behaviour against configured rules.',
    icon: '02',
  },
  {
    title: 'Risk Assessment',
    description: 'Convert observed flight behaviour into a deterministic risk score.',
    icon: '03',
  },
  {
    title: 'AI Mission Debrief',
    description: 'Generate an intelligent interpretation of the assessment.',
    icon: '04',
  },
];

const INPUTS = [
  {
    name: 'Flight Data Recorder',
    detail: 'CSV flight telemetry',
    active: true,
  },
  {
    name: 'Mission Logs',
    detail: 'Operational mission records',
    active: false,
  },
  {
    name: 'Flight Procedures',
    detail: 'SOP and operational rules',
    active: false,
  },
  {
    name: 'Training Manual',
    detail: 'Pilot training references',
    active: false,
  },
];

function WorkflowNode({
  label,
  number,
}: {
  label: string;
  number: string;
}) {
  return (
    <div className="flex min-w-[100px] flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e10600]/50 bg-[#1b1515] text-xs font-semibold text-[#e10600]">
        {number}
      </div>

      <span className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        {label}
      </span>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState<LoginResponse | null>(() => {
    const stored = localStorage.getItem('red-scale-auth');

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as LoginResponse;
    } catch {
      localStorage.removeItem('red-scale-auth');
      return null;
    }
  });

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [fileName, setFileName] = useState('');

  function handleAssessment(result: Assessment, name: string) {
    setAssessment(result);
    setFileName(name);
  }

  function handleNewAssessment() {
    setAssessment(null);
    setFileName('');
  }

  function handleLogin(result: LoginResponse) {
    localStorage.setItem(
      'red-scale-auth',
      JSON.stringify(result),
    );

    setAuth(result);
  }

  function handleLogout() {
    localStorage.removeItem('red-scale-auth');
    setAuth(null);
    setAssessment(null);
    setFileName('');
  }

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  if (auth.role === 'trainee') {
    return (
      <div className="flex min-h-full flex-col bg-[#0c0c0c]">
        <Header
          onNewAssessment={handleNewAssessment}
          hasAssessment={false}
          username={auth.name}
          role={auth.role}
          onLogout={handleLogout}
        />

        <TraineeDashboard username={auth.name} />

        <ChatAssistant />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[#0c0c0c]">
      <Header
        onNewAssessment={handleNewAssessment}
        hasAssessment={assessment !== null}
        username={auth.name}
        role={auth.role}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {assessment ? (
          <AssessmentResults
            assessment={assessment}
            fileName={fileName}
          />
        ) : (
          <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-[#2b2b2b] bg-[#111111] px-6 py-14 sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e10600]/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[#e10600]/5 blur-3xl" />

              <div className="relative text-center">
                <div className="mb-7 flex items-center justify-center gap-2">
                  <div className="h-12 w-1.5 rounded-sm bg-[#e10600]" />

                  <span className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    Red Scale
                  </span>

                  <div className="h-12 w-1.5 rounded-sm bg-[#e10600]" />
                </div>

                <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#2e2e2e] bg-[#171717] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e10600]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Pilot Assessment & Mission Intelligence
                  </span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                  AI Pilot Debrief & Assessment System
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                  Transform flight data into objective performance assessments,
                  operational findings, and intelligent mission debriefs.
                </p>
              </div>

              {/* Capability pills */}
              <div className="relative mt-9 flex flex-wrap justify-center gap-2">
                {CAPABILITIES.map((capability) => (
                  <span
                    key={capability.title}
                    className="rounded-full border border-[#e10600]/25 bg-[#171111] px-4 py-2 text-xs text-red-300"
                  >
                    {capability.title}
                  </span>
                ))}
              </div>
            </section>

            {/* Workflow */}
            <section className="mt-6 rounded-3xl border border-[#2b2b2b] bg-[#111111] p-6 sm:p-8">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
                    Assessment Pipeline
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    From flight data to mission intelligence
                  </h2>
                </div>

                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-gray-600 sm:block">
                  Deterministic → AI
                </span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="mx-auto flex min-w-[620px] items-start justify-center">
                  <WorkflowNode label="FDR CSV" number="01" />

                  <div className="mt-5 h-px w-12 bg-gradient-to-r from-[#e10600]/50 to-[#444]" />

                  <WorkflowNode label="Parser" number="02" />

                  <div className="mt-5 h-px w-12 bg-gradient-to-r from-[#444] to-[#e10600]/50" />

                  <WorkflowNode label="Features" number="03" />

                  <div className="mt-5 h-px w-12 bg-gradient-to-r from-[#e10600]/50 to-[#444]" />

                  <WorkflowNode label="Rules" number="04" />

                  <div className="mt-5 h-px w-12 bg-gradient-to-r from-[#444] to-[#e10600]/50" />

                  <WorkflowNode label="Risk" number="05" />

                  <div className="mt-5 h-px w-12 bg-gradient-to-r from-[#e10600]/50 to-[#444]" />

                  <WorkflowNode label="AI Debrief" number="06" />
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#2b2b2b] bg-[#161616] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                    Evidence
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Raw flight telemetry
                  </p>
                </div>

                <div className="rounded-xl border border-[#2b2b2b] bg-[#161616] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                    Assessment
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Rules, features & risk
                  </p>
                </div>

                <div className="rounded-xl border border-[#e10600]/20 bg-[#1a1212] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#e10600]">
                    Intelligence
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    AI-generated debrief
                  </p>
                </div>
              </div>
            </section>

            {/* Upload + system overview */}
            <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e10600]">
                    Mission Input
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Upload flight data
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    Start an assessment by providing a Flight Data Recorder
                    CSV. Red Scale will parse the telemetry and evaluate the
                    flight against the current assessment rules.
                  </p>
                </div>

                <FDRUpload onAssessment={handleAssessment} />

                <div className="mt-5 flex items-center gap-2 text-xs text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                  CSV assessment endpoint online
                </div>
              </div>

              <div className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600">
                    System Capabilities
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Operational intelligence
                  </h2>
                </div>

                <div className="space-y-3">
                  {CAPABILITIES.map((capability) => (
                    <div
                      key={capability.title}
                      className="group flex gap-4 rounded-xl border border-[#252525] bg-[#161616] p-4 transition-colors hover:border-[#e10600]/30"
                    >
                      <div className="text-xs font-semibold text-[#e10600]">
                        {capability.icon}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {capability.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Supported inputs */}
            <section className="mt-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#252525]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-600">
                  Supported Mission Inputs
                </span>

                <div className="h-px flex-1 bg-[#252525]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {INPUTS.map((input) => (
                  <div
                    key={input.name}
                    className={`rounded-2xl border p-5 ${
                      input.active
                        ? 'border-[#e10600]/30 bg-[#171111]'
                        : 'border-[#252525] bg-[#111111]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          input.active ? 'text-[#e10600]' : 'text-gray-600'
                        }`}
                      >
                        {input.active ? 'ACTIVE' : 'PLANNED'}
                      </span>

                      <span className="text-[10px] font-mono text-gray-700">
                        CSV
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-medium text-gray-300">
                      {input.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {input.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer positioning */}
            <footer className="mt-10 border-t border-[#202020] pt-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700">
                Red Scale · Pilot Assessment Console
              </p>

              <p className="mt-2 text-xs text-gray-700">
                Deterministic flight assessment with AI-assisted mission
                debriefing
              </p>
            </footer>
          </div>
        )}
      </main>
      <ChatAssistant />
    </div>
  );
}