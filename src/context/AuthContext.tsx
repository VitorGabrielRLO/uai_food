// Em: src/context/AuthContext.tsx

'use client'; 

import { createContext, ReactNode, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { loginSchema } from '@/lib/schemas';
import { User } from '@/types/user'; // Importando do nosso arquivo de tipos (seguro)

type LoginData = z.infer<typeof loginSchema>;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('uaifood.token');
    const userData = localStorage.getItem('uaifood.user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Falha ao carregar dados do localStorage, limpando...');
        localStorage.removeItem('uaifood.token');
        localStorage.removeItem('uaifood.user');
      }
    }
    setIsLoading(false);
  }, []);

  async function login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data);
      const { token, user: userData } = response.data;
      localStorage.setItem('uaifood.token', token);
      localStorage.setItem('uaifood.user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Falha no login. Verifique seu telefone e senha.');
    }
  }

  function logout() {
    localStorage.removeItem('uaifood.token');
    localStorage.removeItem('uaifood.user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/');
  }

  // O <AuthProvider> DEVE SEMPRE renderizar {children}
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};