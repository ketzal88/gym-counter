'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Aún cargando

    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Mostrar loading mientras verifica autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada mientras redirige
  if (!session) {
    return null;
  }

  // Usuario autenticado, mostrar contenido protegido
  return <>{children}</>;
}
