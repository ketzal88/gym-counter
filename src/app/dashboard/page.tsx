import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/guards/OnboardingGuard';
import UnifiedDashboard from '../components/UnifiedDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <UnifiedDashboard />
      </OnboardingGuard>
    </AuthGuard>
  );
}
