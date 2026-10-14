import { useEffect, useState } from 'react';
import Header from './components/Header';
import ChatAssistant from './components/ChatAssistant';
import Login from './components/Login';
import {
  getCurrentUser,
  getTrainees,
  type CurrentUser,
  type LoginResponse,
  type Trainee,
} from './api/auth';
import { AUTH_EVENTS } from './api/client';
import TraineeDashboard from './components/TraineeDashboard';
import AutonomousFlightAssessment from './components/AutonomousFlightAssessment';
import AdminDashboard from './components/AdminDashboard';
import TornadoSection from './components/TornadoSection';
import TrainerDashboard from './components/TrainerDashboard';

export default function App() {
    const [auth, setAuth] = useState<CurrentUser | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [showAutonomy, setShowAutonomy] = useState(false);
    const [showAuthenticatedTornado, setShowAuthenticatedTornado] =
      useState(false);

    useEffect(() => {
      async function validateSession() {
        const stored = localStorage.getItem('red-scale-auth');

        if (!stored) {
          setIsCheckingAuth(false);
          return;
        }

        try {
          const currentUser = await getCurrentUser();

          setAuth(currentUser);
        } catch {
          localStorage.removeItem('red-scale-auth');
          setAuth(null);
        } finally {
          setIsCheckingAuth(false);
        }
      }

      validateSession();
    }, []);

  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem('red-scale-auth');
      setAuth(null);
    }

    window.addEventListener(
      AUTH_EVENTS.unauthorized,
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        AUTH_EVENTS.unauthorized,
        handleUnauthorized,
      );
    };
  }, []);

  useEffect(() => {
    if (!auth || auth.role !== 'trainer') {
      setTrainees([]);
      return;
    }

    async function loadTrainees() {
      try {
        const result = await getTrainees();
        setTrainees(result);
      } catch (err) {
        console.error('Unable to load trainees:', err);
      }
    }

    loadTrainees();
  }, [auth]);


  function handleNewAssessment() {
    // The Header callback is retained for compatibility.
    // TrainerDashboard manages its own assessment workflow.
  }

  function handleLogin(result: LoginResponse) {
    localStorage.setItem(
      'red-scale-auth',
      JSON.stringify(result),
    );

    setAuth({
      id: result.user_id,
      email: result.email,
      name: result.name,
      avatar_url: null,
      role: result.role,
    });
  }

  function handleLogout() {
    localStorage.removeItem('red-scale-auth');
    setAuth(null);
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e10600]/20 border-t-[#e10600]" />

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Validating session
          </p>
        </div>
      </div>
    );
  }

  if (!auth) {
    if (showAutonomy) {
      return (
        <AutonomousFlightAssessment
          onBack={() => setShowAutonomy(false)}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onTryAutonomy={() => setShowAutonomy(true)}
      />
    );
  }

  if (showAuthenticatedTornado) {
      return (
        <AutonomousFlightAssessment
          onBack={() => setShowAuthenticatedTornado(false)}
        />
      );
    }

  if (auth.role === 'admin') {
    return (
      <div className="flex min-h-screen flex-col bg-[#0c0c0c]">
        <Header
          onNewAssessment={handleNewAssessment}
          hasAssessment={false}
          username={auth.name}
          role={auth.role}
          onLogout={handleLogout}
        />

        <AdminDashboard />

        <TornadoSection
          onOpen={() => setShowAuthenticatedTornado(true)}
        />
      </div>
    );
  }

  if (auth.role === 'trainee') {
    return (
      <div className="flex min-h-screen flex-col bg-[#0c0c0c]">
        <Header
          onNewAssessment={handleNewAssessment}
          hasAssessment={false}
          username={auth.name}
          role={auth.role}
          onLogout={handleLogout}
        />

        <TraineeDashboard
          username={auth.name}
          pilotId={auth.id}
        />

        <TornadoSection
          onOpen={() => setShowAuthenticatedTornado(true)}
        />

        <ChatAssistant />
        <footer className="border-t border-[#202020] px-5 py-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700">
            Red Scale · Trainee Portal
          </p>

          <p className="mt-2 text-xs text-gray-700">
            Review your flight performance and mission debriefs
          </p>
        </footer>
      </div>
    );
  }

  if (auth.role === 'trainer') {
    return (
      <div className="flex min-h-screen flex-col bg-[#0c0c0c]">
        <Header
          onNewAssessment={handleNewAssessment}
          hasAssessment={false}
          username={auth.name}
          role={auth.role}
          onLogout={handleLogout}
        />

        <TrainerDashboard
          trainees={trainees}
          currentUserId={auth.id}
        />

        <TornadoSection
          onOpen={() => setShowAuthenticatedTornado(true)}
        />

        <ChatAssistant />

        <footer className="border-t border-[#202020] px-5 py-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700">
            Red Scale · Trainer Console
          </p>
          <p className="mt-2 text-xs text-gray-700">
            Flight assessment and training management
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c]">
      

      <TornadoSection
        onOpen={() => setShowAuthenticatedTornado(true)}
      />
      <ChatAssistant />

      <footer className="border-t border-[#202020] px-5 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700">
          Red Scale · Pilot Assessment Console
        </p>

        <p className="mt-2 text-xs text-gray-700">
          Deterministic flight assessment with AI-assisted mission
          debriefing
        </p>
      </footer>
    </div>
  );
}