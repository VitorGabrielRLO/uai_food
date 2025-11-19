'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { UserType } from '@prisma/client'; 
import Link from 'next/link';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'sonner';

// --- Componente de Navbar (Barra de Navegação) ---
function Navbar({
  userName,
  userType,
  onLogout,
}: {
  userName: string;
  userType: UserType; 
  onLogout: () => void;
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Lado Esquerdo: Logo e Menu Principal */}
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight hover:opacity-80 transition-opacity"
          >
            UAIFood
          </Link>

          {/* Container dos Botões do Menu */}
          <div className="hidden md:flex items-center gap-4">
               {/* Botões para CLIENTE */}
              {userType === 'CLIENT' && (
                <>
                  <Link
                    href="/dashboard/addresses"
                    className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-all"
                  >
                    📍 Endereços
                  </Link>
                  <Link
                    href="/dashboard/my-orders"
                    className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-all"
                  >
                    📦 Meus Pedidos
                  </Link>
                </>
              )}

               {/* Links para ADMIN (Mantendo estilo simples, mas espaçado) */}
               {userType === 'ADMIN' && (
                <div className="flex gap-4 text-sm font-medium">
                  <Link href="/dashboard/admin/categories" className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Categorias</Link>
                  <Link href="/dashboard/admin/items" className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Itens</Link>
                  <Link href="/dashboard/admin/orders" className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Pedidos</Link>
                </div>
              )}
          </div>
        </div>

        {/* Lado Direito: Ações e Perfil */}
        <div className="flex items-center gap-4">
          {/* Botão de Ação Principal (Só para Cliente) */}
          {userType === 'CLIENT' && (
            <Link
              href="/dashboard/order"
              className="hidden sm:inline-flex items-center gap-2 justify-center rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 hover:shadow-md transition-all transform hover:-translate-y-0.5"
            >
              🛍️ Fazer Pedido
            </Link>
          )}
          
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block"></div>

          <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-700 dark:text-zinc-300 hidden md:flex flex-col items-end leading-tight">
                <span className="text-xs text-zinc-500">Olá,</span>
                <span className="font-bold truncate max-w-[150px]">{userName}</span>
              </span>
              
              <button
                onClick={onLogout}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-300 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-all"
                title="Sair do sistema"
              >
                Sair
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// --- O Layout Principal ---
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace('/'); 
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
        <Navbar
          userName={user?.name || 'Usuário'} 
          userType={user?.userType as UserType}
          onLogout={logout}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
          {children} 
        </main>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </CartProvider>
  );
}