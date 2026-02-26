import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/guards/OnboardingGuard';
import SubscriptionGuard from '../components/guards/SubscriptionGuard';
import TrialBanner from '../components/TrialBanner';
import UnifiedDashboard from '../components/UnifiedDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <SubscriptionGuard>
          <TrialBanner />
          <UnifiedDashboard />
        </SubscriptionGuard>
      </OnboardingGuard>
    </AuthGuard>
  );
}
