'use client'; // Precisa ser 'client' para usar o hook useAuth

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth(); // Pega o usuário do contexto

  // Como esta página está dentro de /dashboard/layout.tsx,
  // já temos 100% de certeza que 'user' não é nulo.
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
        Bem-vindo ao seu Dashboard, {user?.name}!
      </h1>
      
      {user?.userType === 'ADMIN' ? ( //
        <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
          Você está logado como **Administrador**. Use o menu acima para gerenciar o cardápio e os pedidos.
        </p>
      ) : (
        <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
          Você está logado como **Cliente**. Use o menu acima para ver seus pedidos ou fazer um novo.
        </p>
      )}
    </div>
  );
}