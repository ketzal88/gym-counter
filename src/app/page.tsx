import Counter from './components/Counter';
import Stats from './components/Stats';
import InspirationalQuote from './components/InspirationalQuote';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💪 GymCounter 🏋️</h1>
          <p className="text-gray-700">📊 Track your gym attendance and stay motivated! 🔥</p>
        </header>
        
        <InspirationalQuote />
        
        <Counter />
        <Stats />
      </div>
    </div>
  );
}
