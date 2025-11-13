'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, Item } from '@prisma/client'; // Tipos do Prisma
import { api } from '@/lib/axios';
import { itemSchema } from '@/lib/schemas'; // Nosso schema de criação de item

// O 'itemSchema' do Zod espera um 'unitPrice' como number.
// Precisamos ajustar o schema para o formulário, que lê 'number' como string.
// Ou, mais fácil, forçar a conversão no 'register' do react-hook-form.
type ItemFormData = z.infer<typeof itemSchema>;

// Tipo para o Item quando listado (com a categoria incluída)
type ItemWithCategory = Item & {
  category: {
    description: string;
  };
};

export default function AdminItemsPage() {
  // Estados da página
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook do formulário para "Criar Novo Item"
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  // --- Funções de API ---

  // 1. Função para buscar todos os dados (Itens E Categorias)
  async function fetchData() {
    setIsLoading(true);
    try {
      // Usamos Promise.all para buscar ambos em paralelo
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/items'), // API pública de listagem de itens
        api.get('/categories'), // API pública de listagem de categorias
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

  // 2. Função para CRIAR um novo item
  async function handleCreateItem(data: ItemFormData) {
    try {
      // Usamos a rota ADMIN de criação de item
      await api.post('/admin/items', data);
      alert('Item criado com sucesso!');
      reset(); // Limpa o formulário
      fetchData(); // Atualiza a lista de itens
    } catch (error: any) {
      console.error('Erro ao criar item:', error);
      if (error.response?.status === 400 && error.response.data.message) {
        alert(error.response.data.message); // Ex: "A categoria informada não existe"
      } else {
        alert('Falha ao criar item.');
      }
    }
  }

  // 3. Função para DELETAR um item
  async function handleDeleteItem(id: string) {
    if (!confirm('Tem certeza que deseja deletar este item?')) {
      return;
    }

    try {
      // Usamos a rota ADMIN de delete
      await api.delete(`/admin/items/${id}`);
      alert('Item deletado com sucesso!');
      fetchData(); // Atualiza a lista
    } catch (error: any) {
      console.error('Erro ao deletar item:', error);
      if (error.response?.status === 409) {
        alert(error.response.data.message); // Ex: "Item faz parte de pedidos"
      } else {
        alert('Falha ao deletar item.');
      }
    }
  }

  // Busca os dados iniciais quando o componente é montado
  useEffect(() => {
    fetchData();
  }, []);

  // --- Renderização (JSX) ---
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Gerenciar Itens do Cardápio
      </h1>

      {/* 1. Formulário de Criação */}
      <form
        onSubmit={handleSubmit(handleCreateItem)}
        className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800"
      >
        <h2 className="mb-4 text-xl font-semibold">Novo Item</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Coluna Descrição */}
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
              {...register('description')} //
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Coluna Preço */}
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
              step="0.01" // Permite centavos
              placeholder="45.50"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-400"
              {...register('unitPrice', { valueAsNumber: true })} //
            />
            {errors.unitPrice && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.unitPrice.message}
              </p>
            )}
          </div>

          {/* Coluna Categoria */}
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
              {...register('categoryId')} //
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

      {/* 2. Lista de Itens Existentes */}
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
                      {/* Formatando o preço para BRL */}
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