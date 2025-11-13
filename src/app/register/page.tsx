'use client'; // Obrigatório para hooks de formulário e API

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '@/lib/schemas'; // Nosso schema de validação de registro
import { api } from '@/lib/axios'; // Nossa instância do axios
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Criar um tipo inferido a partir do schema do Zod
type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter(); // Para redirecionar após o registro

  // Configurar o react-hook-form com o schema de registro
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  // Função chamada no 'submit' do formulário
  async function handleRegister(data: RegisterData) {
    try {
      // 1. Chamar nossa API de registro diretamente
      await api.post('/auth/register', data);

      // 2. Se for sucesso, avisar e redirecionar para o login
      alert('Usuário cadastrado com sucesso! Faça seu login.');
      router.push('/'); // Redireciona para a página de login (home)
    } catch (err: any) {
      console.error('Erro no registro:', err);
      
      // Tratar erro de "telefone já existe" (409 Conflict)
      if (err.response?.status === 409) {
        alert('Este telefone já está em uso.');
      } else {
        alert('Falha ao registrar. Tente novamente.');
      }
    }
  }

  // O JSX (HTML) do formulário
  // Note como a estilização é idêntica à página de login
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
          Registre-se - UAIFood
        </h2>
        
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
          
          {/* Campo Nome */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('name')} //
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Campo Telefone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="(34) 99999-8888"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('phone')} //
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('password')} //
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {isSubmitting ? 'Registrando...' : 'Criar conta'}
          </button>

          {/* Link para Login */}
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Já tem uma conta?{' '}
            <Link
              href="/" // Link de volta para a home (login)
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}