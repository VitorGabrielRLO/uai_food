'use client'; // Obrigatório para usar hooks (useAuth, useRouter, useEffect)

import { useAuth } from '@/context/AuthContext'; // Nosso hook de autenticação
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { UserType } from '@prisma/client'; // Tipagem do Prisma
import Link from 'next/link';

// --- Componente de Navbar (Barra de Navegação) ---
function Navbar({
  userName,
  userType,
  onLogout,
}: {
  userName: string;
  userType: UserType; //
  onLogout: () => void;
}) {
  return (
    <nav className="flex w-full items-center justify-between bg-white p-4 shadow-md dark:bg-zinc-800">
      <Link
        href="/dashboard"
        className="text-lg font-bold text-zinc-900 dark:text-white"
      >
        UAIFood
      </Link>
      <div className="flex items-center gap-4">
        {/* Mostra links de Admin se o usuário for ADMIN */}
        {userType === 'ADMIN' && ( //
          <>
            <Link
              href="/dashboard/admin/categories" // (Criaremos depois)
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Categorias
            </Link>
            <Link
              href="/dashboard/admin/items" // (Criaremos depois)
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Itens
            </Link>
            <Link
              href="/dashboard/admin/orders" // (Criaremos depois)
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Fila de Pedidos
            </Link>
          </>
        )}
        
        {/* Links para todos os usuários logados */}
        <Link
          href="/dashboard/my-orders" // (Criaremos depois)
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
        >
          Meus Pedidos
        </Link>
        
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          Olá, <span className="font-medium">{userName}</span>
        </span>
        
        <button
          onClick={onLogout}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
// --- Fim do Navbar ---


// --- O Layout Principal ---
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Espera o AuthContext terminar de carregar (verificar o localStorage)
    if (isLoading) {
      return;
    }

    // 2. Se não estiver carregando E não estiver autenticado, redireciona
    if (!isAuthenticated) {
      router.replace('/'); // Volta para a página de login
    }
  }, [isAuthenticated, isLoading, router]);

  // 3. Enquanto carrega ou espera o redirecionamento, não mostra nada
  // Isso evita um "flash" da página de dashboard antes do usuário ser redirecionado
  if (isLoading || !isAuthenticated) {
    return null; // ou você pode retornar um <Spinner />
  }

  // 4. Se chegou aqui, o usuário está logado. Mostra o layout.
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <Navbar
        userName={user?.name || 'Usuário'} //
        userType={user?.userType as UserType}
        onLogout={logout}
      />
      <main className="flex-1 p-8">
        {children} {/* Aqui é onde a 'page.tsx' do dashboard será renderizada */}
      </main>
    </div>
  );
}