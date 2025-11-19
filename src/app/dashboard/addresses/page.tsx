// Em: src/app/dashboard/addresses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { addressSchema } from '@/lib/schemas';
import { toast } from 'sonner';

// Tipo inferido do schema
type AddressFormData = z.infer<typeof addressSchema>;

// Tipo vindo do banco de dados (estende o formulário + id)
type Address = AddressFormData & { id: string };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  // Função para buscar endereços da API
  async function fetchAddresses() {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data);
    } catch (error) {
      toast.error('Erro ao carregar endereços.');
    } finally {
      setIsLoading(false);
    }
  }

  // Função para criar um novo endereço
  async function handleCreateAddress(data: AddressFormData) {
    try {
      await api.post('/addresses', data);
      toast.success('Endereço cadastrado com sucesso!');
      reset(); // Limpa o formulário
      fetchAddresses(); // Atualiza a lista na hora
    } catch (error) {
      toast.error('Erro ao salvar endereço. Verifique os dados.');
    }
  }

  // Função para deletar (placeholder para o futuro)
  async function handleDelete(id: string) {
    if (!confirm('Deseja remover este endereço?')) return;
    try {
       // await api.delete(`/addresses/${id}`); // Futuramente você pode criar essa rota
       toast.info('Funcionalidade de deletar será implementada em breve!');
    } catch (error) {
      toast.error('Erro ao deletar.');
    }
  }

  // Carrega os dados ao abrir a página
  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Meus Endereços
      </h1>

      {/* Formulário de Cadastro */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">Novo Endereço</h2>
        <form onSubmit={handleSubmit(handleCreateAddress)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* CEP */}
            <div>
              <label className="block text-sm font-medium dark:text-zinc-300">CEP</label>
              <input
                type="text"
                placeholder="38000000"
                {...register('zipCode')}
                className="w-full rounded-md border border-zinc-300 p-2 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
              {errors.zipCode && <span className="text-sm text-red-500">{errors.zipCode.message}</span>}
            </div>
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium dark:text-zinc-300">Estado (UF)</label>
              <input
                type="text"
                placeholder="MG"
                maxLength={2}
                {...register('state')}
                className="w-full rounded-md border border-zinc-300 p-2 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
              {errors.state && <span className="text-sm text-red-500">{errors.state.message}</span>}
            </div>
            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium dark:text-zinc-300">Cidade</label>
              <input
                type="text"
                placeholder="Uberaba"
                {...register('city')}
                className="w-full rounded-md border border-zinc-300 p-2 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
              {errors.city && <span className="text-sm text-red-500">{errors.city.message}</span>}
            </div>
            {/* Bairro */}
            <div>
              <label className="block text-sm font-medium dark:text-zinc-300">Bairro</label>
              <input
                type="text"
                placeholder="Centro"
                {...register('district')}
                className="w-full rounded-md border border-zinc-300 p-2 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
              {errors.district && <span className="text-sm text-red-500">{errors.district.message}</span>}
            </div>
            {/* Rua */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-zinc-300">Rua</label>
              <input
                type="text"
                placeholder="Av. Leopoldino de Oliveira"
                {...register('street')}
                className="w-full rounded-md border border-zinc-300 p-2 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
              {errors.street && <span className="text-sm text-red-500">{errors.street.message}</span>}
            </div>
            {/* Número */}
            <div>
              <label className="block text-sm font-medium dark:text-zinc-300">Número</label>
              <input
                type="text"
                placeholder="123"
                {...register('number')}
                className="w-full rounded-md border border-zinc-300 p-2 dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              />
              {errors.number && <span className="text-sm text-red-500">{errors.number.message}</span>}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Endereço'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Endereços Existentes */}
      <h2 className="mb-4 text-xl font-semibold dark:text-white">Endereços Cadastrados</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading ? (
          <p className="dark:text-zinc-300">Carregando...</p>
        ) : addresses.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">Nenhum endereço cadastrado ainda.</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:bg-zinc-800 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white text-lg">{addr.street}, {addr.number}</p>
                  <p className="text-zinc-600 dark:text-zinc-300">{addr.district}</p>
                  <p className="text-zinc-600 dark:text-zinc-300">{addr.city} - {addr.state}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">CEP: {addr.zipCode}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex justify-end">
                <button 
                  onClick={() => handleDelete(addr.id)} 
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}