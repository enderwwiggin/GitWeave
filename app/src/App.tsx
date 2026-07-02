import GridBackground from './components/GridBackground';
import AppHeader from './components/AppHeader';
import HeroStats from './components/HeroStats';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './hooks/useAuth';

function AppInner() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-[#050507]">
      <GridBackground />
      <AppHeader />
      <HeroStats />
      <Dashboard />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}