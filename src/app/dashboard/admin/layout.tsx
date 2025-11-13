'use client'; // Obrigatório para hooks

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Espera o contexto terminar de carregar
    if (isLoading) {
      return;
    }

    // 2. Se não estiver autenticado (já checado pelo layout.tsx pai)
    // ou se NÃO for um admin, redireciona
    if (!isAuthenticated || user?.userType !== 'ADMIN') { //
      // Redireciona para o dashboard principal (que é seguro)
      router.replace('/dashboard');
    }
  }, [user, isAuthenticated, isLoading, router]);

  // 3. Se estiver carregando ou se o usuário não for admin,
  // não renderiza nada para evitar "flash" de conteúdo.
  if (isLoading || !isAuthenticated || user?.userType !== 'ADMIN') {
    return null; // Ou um <Spinner />
  }

  // 4. Usuário é um Admin! Renderiza a página.
  return <>{children}</>;
}