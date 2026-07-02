import GridBackground from './components/GridBackground';
import AppHeader from './components/AppHeader';
import HeroStats from './components/HeroStats';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050507]">
      <GridBackground />
      <AppHeader />
      <HeroStats />
      <Dashboard />
    </div>
  );
}
