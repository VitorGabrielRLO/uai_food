'use client'; // Contextos que usam hooks (useState, etc) precisam ser Client Components

import { createContext, ReactNode, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api } from '@/lib/axios'; // Nossa instância do axios
import { loginSchema } from '@/lib/schemas';
import { User } from '@prisma/client'; // Importando o tipo do Prisma

// Tipo para os dados do login (do nosso Zod schema)
type LoginData = z.infer<typeof loginSchema>;

// Tipo para o que o contexto vai fornecer
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// O Contexto
const AuthContext = createContext({} as AuthContextType);

// O Provedor (Componente que vai envolver nosso app)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Para checar o token no localStorage
  const router = useRouter();

  const isAuthenticated = !!user;

  // Efeito para carregar o token do localStorage quando o app inicia
  useEffect(() => {
    const token = localStorage.getItem('uaifood.token');
    const userData = localStorage.getItem('uaifood.user');

    if (token && userData) {
      // Se acharmos, configuramos o usuário e o header do axios
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  // Função de LOGIN
  async function login(data: LoginData) {
    try {
      // 1. Chamar nossa API de login
      const response = await api.post('/auth/login', data);
      const { token, user: userData } = response.data;

      // 2. Salvar o token e usuário no localStorage
      localStorage.setItem('uaifood.token', token);
      localStorage.setItem('uaifood.user', JSON.stringify(userData));

      // 3. Configurar o header padrão do axios para futuras requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 4. Atualizar o estado
      setUser(userData);

      // 5. Redirecionar para o Dashboard (ou home)
      router.push('/dashboard'); // (Vamos criar essa página depois)
    } catch (err) {
      console.error('Erro no login:', err);
      // Aqui você pode adicionar um toast ou estado de erro
      alert('Falha no login. Verifique seu telefone e senha.');
    }
  }

  // Função de LOGOUT
  function logout() {
    // 1. Limpar localStorage
    localStorage.removeItem('uaifood.token');
    localStorage.removeItem('uaifood.user');

    // 2. Limpar header do axios e estado
    delete api.defaults.headers.common['Authorization'];
    setUser(null);

    // 3. Redirecionar para o login (página inicial)
    router.push('/');
  }

  // Não renderiza nada até que o token (ou falta dele) seja verificado
  if (isLoading) {
    return null; // ou um <Spinner />
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};