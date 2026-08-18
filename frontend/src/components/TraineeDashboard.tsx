interface TraineeDashboardProps {
  username: string;
}

export default function TraineeDashboard({
  username,
}: TraineeDashboardProps) {
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
                  No assessment available
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Your instructor has not assigned an assessment to your
                  account yet. Once an assessment is available, your flight
                  performance and AI debrief will appear here.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                Assessments
              </p>

              <p className="mt-3 text-2xl font-semibold text-white">
                0
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Completed assessments
              </p>
            </div>

            <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                Risk
              </p>

              <p className="mt-3 text-2xl font-semibold text-gray-500">
                —
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Latest risk rating
              </p>
            </div>

            <div className="rounded-2xl border border-[#252525] bg-[#161616] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                Debrief
              </p>

              <p className="mt-3 text-2xl font-semibold text-gray-500">
                —
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Latest instructor debrief
              </p>
            </div>
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