'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category } from '@/types/user'; // <--- CORREÇÃO AQUI
import { api } from '@/lib/axios';
import { categorySchema } from '@/lib/schemas';

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  async function fetchCategories() {
    setIsLoadingData(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      alert('Não foi possível carregar as categorias.');
    } finally {
      setIsLoadingData(false);
    }
  }

  async function handleCreateCategory(data: CategoryFormData) {
    try {
      await api.post('/admin/categories', data);
      alert('Categoria criada com sucesso!');
      reset(); 
      fetchCategories(); 
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      if (error.response?.status === 409) {
        alert('Esta categoria já existe.');
      } else {
        alert('Falha ao criar categoria.');
      }
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return;
    }
    try {
      await api.delete(`/admin/categories/${id}`);
      alert('Categoria deletada com sucesso!');
      fetchCategories(); 
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error);
      if (error.response?.status === 409) {
        alert(error.response.data.message); 
      } else {
        alert('Falha ao deletar categoria.');
      }
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Gerenciar Categorias
      </h1>

      {/* Formulário */}
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
              {...register('description')}
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

      {/* Lista */}
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