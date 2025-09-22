import Counter from './components/Counter';
import Stats from './components/Stats';
import InspirationalQuote from './components/InspirationalQuote';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/Navbar';
import PersonalDashboard from './components/PersonalDashboard';

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💪 GymCounter 🏋️</h1>
              <p className="text-gray-700">📊 Track your gym attendance and stay motivated! 🔥</p>
            </header>
            
            <InspirationalQuote />
            
            <PersonalDashboard />
            
            {/* Sección de contadores - temporal para desarrollo */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Contadores de Desarrollo (temporal)</h3>
              <Counter />
              <Stats />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
