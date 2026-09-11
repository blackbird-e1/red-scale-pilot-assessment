import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle, type LoginResponse } from '../api/auth';

interface LoginProps {
  onLogin: (result: LoginResponse) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <main className="flex min-h-screen items-center justify-center bg-[#0c0c0c] px-5">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#2b2b2b] bg-[#111111] p-8 sm:p-10">
          <div className="text-center">
            <div className="mb-7 flex items-center justify-center gap-2">
              <div className="h-10 w-1.5 rounded-sm bg-[#e10600]" />

              <span className="text-4xl font-bold tracking-tight text-white">
                Red Scale
              </span>

              <div className="h-10 w-1.5 rounded-sm bg-[#e10600]" />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2e2e2e] bg-[#171717] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e10600]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Pilot Assessment & Mission Intelligence
              </span>
            </div>

            <h1 className="text-xl font-semibold text-white">
              Sign in to Red Scale
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Access the pilot assessment console.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
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

          <div className="mt-8 border-t border-[#222222] pt-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-700">
              Red Scale · Pilot Assessment Console
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}