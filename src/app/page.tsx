import AuthGuard from './components/AuthGuard';
import UnifiedDashboard from './components/UnifiedDashboard';

export default function Home() {
  return (
    <AuthGuard>
      <UnifiedDashboard />
    </AuthGuard>
  );
}
