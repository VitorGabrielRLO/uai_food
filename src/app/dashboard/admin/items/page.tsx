'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, Item } from '@/types/user'; // <--- CORREÇÃO AQUI
import { api } from '@/lib/axios';
import { itemSchema } from '@/lib/schemas';

type ItemFormData = z.infer<typeof itemSchema>;

type ItemWithCategory = Item & {
  category: {
    description: string;
  };
};

export default function AdminItemsPage() {
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  async function fetchData() {
    setIsLoading(true);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/items'),
        api.get('/categories'),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      alert('Não foi possível carregar os dados da página.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateItem(data: ItemFormData) {
    try {
      await api.post('/admin/items', data);
      alert('Item criado com sucesso!');
      reset();
      fetchData();
    } catch (error: any) {
      console.error('Erro ao criar item:', error);
      if (error.response?.status === 400 && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Falha ao criar item.');
      }
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('Tem certeza que deseja deletar este item?')) {
      return;
    }
    try {
      await api.delete(`/admin/items/${id}`);
      alert('Item deletado com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao deletar item:', error);
      if (error.response?.status === 409) {
        alert(error.response.data.message);
      } else {
        alert('Falha ao deletar item.');
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Gerenciar Itens do Cardápio
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit(handleCreateItem)}
        className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800"
      >
        <h2 className="mb-4 text-xl font-semibold">Novo Item</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Descrição */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Descrição
            </label>
            <input
              id="description"
              type="text"
              placeholder="Ex: Pizza Calabresa"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Preço */}
          <div>
            <label
              htmlFor="unitPrice"
              className="mb-2 block text-sm font-medium"
            >
              Preço (Ex: 45.50)
            </label>
            <input
              id="unitPrice"
              type="number"
              step="0.01"
              placeholder="45.50"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('unitPrice', { valueAsNumber: true })}
            />
            {errors.unitPrice && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.unitPrice.message}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-medium"
            >
              Categoria
            </label>
            <select
              id="categoryId"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              {...register('categoryId')}
            >
              <option value="">Selecione...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.description}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Item'}
          </button>
        </div>
      </form>

      {/* Lista */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800">
        <h2 className="mb-4 text-xl font-semibold">Itens Existentes</h2>
        {isLoading ? (
          <p>Carregando itens...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-300">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-300">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-300">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {item.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {item.unitPrice.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {item.category.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <p className="py-4 text-center text-zinc-500 dark:text-zinc-400">
                Nenhum item cadastrado ainda.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}