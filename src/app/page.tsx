import InspirationalQuote from './components/InspirationalQuote';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/Navbar';
import UnifiedDashboard from './components/UnifiedDashboard';

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💪 GymCounter 🏋️</h1>
              {/* <p className="text-gray-700">📊 Track your gym attendance and stay motivated! 🔥</p> */}
            </header>
            
            <InspirationalQuote />
            
            <UnifiedDashboard />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
