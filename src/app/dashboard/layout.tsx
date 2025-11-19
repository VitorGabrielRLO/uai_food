// Em: src/app/dashboard/layout.tsx
'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { UserType } from '@prisma/client'; 
import Link from 'next/link';
import { CartProvider } from '@/context/CartContext'; // <-- 1. IMPORTAR

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
    <nav className="flex w-full items-center justify-between bg-white p-4 shadow-md dark:bg-zinc-800">
      <Link
        href="/dashboard"
        className="text-lg font-bold text-zinc-900 dark:text-white"
      >
        UAIFood
      </Link>
      <div className="flex items-center gap-4">
        {/* Mostra links de Admin se o usuário for ADMIN */}
        {userType === 'ADMIN' && ( 
          <>
            <Link
              href="/dashboard/admin/categories" 
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Categorias
            </Link>
            <Link
              href="/dashboard/admin/items" 
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Itens
            </Link>
            <Link
              href="/dashboard/admin/orders" 
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Fila de Pedidos
            </Link>
          </>
        )}
        
        {/* Links para CLIENTE */}
        {userType === 'CLIENT' && ( // <-- MOSTRAR SÓ PARA CLIENTE
          <Link
            href="/dashboard/order" // <-- 2. ADICIONAR LINK
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Fazer Pedido
          </Link>
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
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace('/'); 
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null; // ou você pode retornar um <Spinner />
  }

  return (
    <CartProvider> {/* <-- 3. ADICIONAR O PROVEDOR DO CARRINHO */}
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
        <Navbar
          userName={user?.name || 'Usuário'} 
          userType={user?.userType as UserType}
          onLogout={logout}
        />
        <main className="flex-1 p-8">
          {children} 
        </main>
      </div>
    </CartProvider>
  );
}