'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category } from '@prisma/client'; // Importando o tipo do Prisma
import { api } from '@/lib/axios'; // Nossa API axios
import { categorySchema } from '@/lib/schemas'; // Nosso schema de criação

// Tipo para os dados do formulário
type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  // Estado para armazenar a lista de categorias buscadas da API
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Hook do formulário para "Criar Nova Categoria"
  const {
    register,
    handleSubmit,
    reset, // Para limpar o formulário após o envio
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  // --- Funções de API ---

  // 1. Função para buscar todas as categorias
  async function fetchCategories() {
    setIsLoadingData(true);
    try {
      // Usamos a rota PÚBLICA de listagem de categorias
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      alert('Não foi possível carregar as categorias.');
    } finally {
      setIsLoadingData(false);
    }
  }

  // 2. Função para CRIAR uma nova categoria
  async function handleCreateCategory(data: CategoryFormData) {
    try {
      // Usamos a rota ADMIN de criação
      await api.post('/admin/categories', data);
      alert('Categoria criada com sucesso!');
      reset(); // Limpa o formulário
      fetchCategories(); // Atualiza a lista de categorias
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      if (error.response?.status === 409) {
        alert('Esta categoria já existe.');
      } else {
        alert('Falha ao criar categoria.');
      }
    }
  }

  // 3. Função para DELETAR uma categoria
  async function handleDeleteCategory(id: string) {
    // Confirmação simples
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return;
    }

    try {
      // Usamos a rota ADMIN de delete
      await api.delete(`/admin/categories/${id}`);
      alert('Categoria deletada com sucesso!');
      fetchCategories(); // Atualiza a lista
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error);
      if (error.response?.status === 409) {
        alert(error.response.data.message); //
      } else {
        alert('Falha ao deletar categoria.');
      }
    }
  }

  // Busca os dados iniciais quando o componente é montado
  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Renderização (JSX) ---
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Gerenciar Categorias
      </h1>

      {/* 1. Formulário de Criação */}
      <form
        onSubmit={handleSubmit(handleCreateCategory)}
        className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800"
      >
        <h2 className="mb-4 text-xl font-semibold">Nova Categoria</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="description" className="sr-only">
              Descrição
            </label>
            <input
              id="description"
              type="text"
              placeholder="Ex: Pizzas, Bebidas, Sobremesas"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('description')} //
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      {/* 2. Lista de Categorias Existentes */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800">
        <h2 className="mb-4 text-xl font-semibold">Categorias Existentes</h2>
        {isLoadingData ? (
          <p>Carregando categorias...</p>
        ) : (
          <ul className="space-y-3">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between rounded-md bg-zinc-50 p-3 dark:bg-zinc-700"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  {category.description}
                </span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                >
                  Deletar
                </button>
              </li>
            ))}
            {categories.length === 0 && (
              <p className="text-zinc-500 dark:text-zinc-400">
                Nenhuma categoria cadastrada ainda.
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}