'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
    router.refresh();
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              💪 GymCounter
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 text-sm font-medium">
                {session.user?.name}
              </span>
            </div>
            
            <button
              onClick={() => {
                // Trigger profile modal from parent component
                const event = new CustomEvent('openProfileModal');
                window.dispatchEvent(event);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              title="Editar perfil"
            >
              Perfil
            </button>
            
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Cerrar Sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
