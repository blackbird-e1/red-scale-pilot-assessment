import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle, type LoginResponse } from '../api/auth';

interface LoginProps {
  onLogin: (result: LoginResponse) => void;
  onTryAutonomy: () => void;
}

export default function Login({
  onLogin,
  onTryAutonomy,
}: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowContact(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleGoogleSuccess(credential: string) {
    setError('');
    setIsLoading(true);

    try {
      const result = await loginWithGoogle(credential);

      onLogin(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in with Google.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleError() {
    setError('Google authentication failed.');
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090909] text-white">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-14">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1.5 rounded-sm bg-[#e10600]" />

            <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Red Scale
            </span>

            <div className="h-8 w-1.5 rounded-sm bg-[#e10600]" />
          </div>

          <p className="hidden text-[9px] font-semibold uppercase tracking-[0.28em] text-gray-600 sm:block">
            Pilot Assessment · Mission Intelligence
          </p>
        </header>

        {/* Hero */}
        <section className="grid min-h-[620px] items-center gap-16 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
          {/* Hero copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#292929] bg-[#111111] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e10600]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                Pilot Assessment & Debriefing
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Turn flight data
              <span className="block text-gray-500">
                into pilot insight.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
              Red Scale brings pilot assessment, flight debriefing, and
              mission intelligence into one place.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              <div className="border-l border-[#333333] pl-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e10600]">
                  Assessment
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Structured evaluation of observed performance.
                </p>
              </div>

              <div className="border-l border-[#333333] pl-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e10600]">
                  Debriefing
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Turn flight observations into useful insight.
                </p>
              </div>

              <div className="border-l border-[#333333] pl-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e10600]">
                  Intelligence
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Build a clearer picture across missions.
                </p>
              </div>
            </div>
          </div>

          {/* Login + telemetry visual */}
          <div className="relative">
            {/* Telemetry decoration */}
            <div className="pointer-events-none absolute -inset-8 hidden lg:block">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full border border-[#202020]" />
              <div className="absolute right-8 top-8 h-48 w-48 rounded-full border border-[#1b1b1b]" />
            </div>

            <div className="relative rounded-3xl border border-[#2b2b2b] bg-[#111111]/95 p-7 shadow-2xl sm:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#e10600]">
                    Red Scale Console
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Pilot Assessment
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e10600]" />

                  <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600">
                    Secure Access
                  </span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#222222] bg-[#0c0c0c] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-600">
                    Flight Performance
                  </p>

                  <p className="font-mono text-[9px] text-gray-700">
                    RED-SCALE / 001
                  </p>
                </div>

                {/* Telemetry visualization */}
                <div className="mt-5 overflow-hidden rounded-xl border border-[#1c1c1c] bg-[#090909]">
                  <svg
                    viewBox="0 0 600 230"
                    className="h-52 w-full"
                    role="img"
                    aria-label="Abstract flight trajectory visualization"
                  >
                    <defs>
                      <linearGradient
                        id="trajectoryFade"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="#333333"
                        />
                        <stop
                          offset="75%"
                          stopColor="#e10600"
                        />
                        <stop
                          offset="100%"
                          stopColor="#ffffff"
                        />
                      </linearGradient>
                    </defs>

                    <g opacity="0.16">
                      <line
                        x1="0"
                        y1="55"
                        x2="600"
                        y2="55"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="115"
                        x2="600"
                        y2="115"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="175"
                        x2="600"
                        y2="175"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />

                      <line
                        x1="100"
                        y1="0"
                        x2="100"
                        y2="230"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <line
                        x1="200"
                        y1="0"
                        x2="200"
                        y2="230"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <line
                        x1="300"
                        y1="0"
                        x2="300"
                        y2="230"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <line
                        x1="400"
                        y1="0"
                        x2="400"
                        y2="230"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <line
                        x1="500"
                        y1="0"
                        x2="500"
                        y2="230"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    </g>

                    {/* Reference trajectory */}
                    <path
                      d="M 20 180 C 90 165, 120 130, 180 135 S 270 100, 330 112 S 430 80, 580 48"
                      fill="none"
                      stroke="#444444"
                      strokeWidth="2"
                      strokeDasharray="7 7"
                    />

                    {/* Observed trajectory */}
                    <path
                      d="M 20 185 C 85 170, 120 140, 180 143 S 250 104, 315 130 S 370 150, 410 101 S 490 92, 580 42"
                      fill="none"
                      stroke="url(#trajectoryFade)"
                      strokeWidth="3"
                    />

                    {/* Event markers */}
                    <circle
                      cx="315"
                      cy="130"
                      r="5"
                      fill="#e10600"
                    />

                    <circle
                      cx="410"
                      cy="101"
                      r="5"
                      fill="#e10600"
                    />

                    <circle
                      cx="315"
                      cy="130"
                      r="11"
                      fill="none"
                      stroke="#e10600"
                      strokeOpacity="0.35"
                    />

                    <circle
                      cx="410"
                      cy="101"
                      r="11"
                      fill="none"
                      stroke="#e10600"
                      strokeOpacity="0.35"
                    />

                    <text
                      x="20"
                      y="215"
                      fill="#444444"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      00.0s
                    </text>

                    <text
                      x="285"
                      y="215"
                      fill="#444444"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      11.2s
                    </text>

                    <text
                      x="540"
                      y="215"
                      fill="#444444"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      22.4s
                    </text>
                  </svg>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-700">
                      Trajectory
                    </p>

                    <p className="mt-1 font-mono text-sm text-gray-300">
                      0.62 m
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-700">
                      Evidence
                    </p>

                    <p className="mt-1 font-mono text-sm text-gray-300">
                      03
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-700">
                      Duration
                    </p>

                    <p className="mt-1 font-mono text-sm text-gray-300">
                      22.4 s
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-center text-xs text-gray-600">
                  Access the pilot assessment and debriefing console.
                </p>

                <div className="mt-5 flex justify-center">
                  {isLoading ? (
                    <p className="text-sm text-gray-500">
                      Signing in...
                    </p>
                  ) : (
                    <GoogleLogin
                      onSuccess={(response) => {
                        if (response.credential) {
                          handleGoogleSuccess(response.credential);
                        } else {
                          handleGoogleError();
                        }
                      }}
                      onError={handleGoogleError}
                    />
                  )}
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
                      Authentication Error
                    </p>

                    <p className="mt-1 text-sm text-red-400">
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TORNADO */}
        <section className="border-t border-[#202020] py-14 sm:py-16">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#252525] bg-[#0f0f0f] px-7 py-8 sm:px-10 sm:py-9">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#e10600]">
                    Tornado
                  </p>

                  <span className="rounded-full border border-[#292929] bg-[#151515] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Public POC · No Account Required
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold text-gray-200 sm:text-2xl">
                  Autonomous Flight Assessment
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                  Evaluate recorded autonomous drone flight telemetry for
                  trajectory, stability, attitude, and control behaviour.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={onTryAutonomy}
                  className="rounded-xl border border-[#333333] bg-[#161616] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 transition-colors hover:border-[#e10600]/60 hover:bg-[#1b1111] hover:text-red-300"
                >
                  Try TORNADO
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Capability strip */}
        <section className="border-t border-[#181818] py-7">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-700">
            <span>Pilot Assessment</span>
            <span className="h-1 w-1 rounded-full bg-[#e10600]" />
            <span>Debriefing</span>
            <span className="h-1 w-1 rounded-full bg-[#e10600]" />
            <span>Mission Intelligence</span>
            <span className="h-1 w-1 rounded-full bg-[#e10600]" />
            <span>Autonomous Flight</span>
          </div>
        </section>

        {/* About / Contact */}
        <section className="py-6 text-center">
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="rounded-xl border border-[#333333] bg-[#111111] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 transition-all hover:border-[#e10600]/60 hover:bg-[#171111] hover:text-white"
          >
            About / Contact
          </button>
        </section>


        {/* Footer */}
        <footer className="pb-5 pt-2 text-center">
          <p className="text-[9px] uppercase tracking-[0.25em] text-gray-800">
            Red Scale · Pilot Assessment Console
          </p>
        </footer>

        {showContact && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
            onClick={() => setShowContact(false)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-[#2b2b2b] bg-[#111111] p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowContact(false)}
                className="absolute right-4 top-4 text-xl leading-none text-gray-600 transition-colors hover:text-white"
                aria-label="Close"
              >
                ×
              </button>

              <div className="pr-8">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#e10600]">
                  Red Scale
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  About Red Scale
                </h2>

                <p className="mt-4 text-sm leading-6 text-gray-400">
                  AI-assisted pilot assessment, flight debriefing, and
                  mission intelligence.
                </p>

                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Red Scale helps pilots and instructors turn recorded
                  flight data into structured assessment evidence,
                  actionable debriefs, and longitudinal insight.
                </p>

                <div className="mt-6 border-t border-[#252525] pt-5">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-gray-600">
                    Interested in learning more or testing Red Scale?
                  </p>

                  <a
                    href="mailto:bluelock.sr71@gmail.com"
                    className="mt-2 inline-block text-sm text-gray-300 transition-colors hover:text-[#e10600]"
                  >
                    bluelock.sr71@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}