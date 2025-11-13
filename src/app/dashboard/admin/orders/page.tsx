'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { DetailedOrder } from '@/types/order'; // Nosso tipo customizado
import { PaymentMethod } from '@prisma/client';

// --- Funções Auxiliares (Helpers) ---

// Formata data (ex: 10/11/2025 14:30)
function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

// Calcula o total do pedido
function calculateOrderTotal(items: DetailedOrder['items']) {
  const total = items.reduce((sum, orderItem) => {
    return sum + orderItem.item.unitPrice * orderItem.quantity;
  }, 0);

  return total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Mapeia os métodos de pagamento para um texto amigável
const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  PIX: 'PIX',
};

// --- Componente da Página ---
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status possíveis para o admin selecionar
  const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_DELIVERY', 'DELIVERED', 'CANCELED'];

  // 1. Função para buscar todos os pedidos
  async function fetchOrders() {
    setIsLoading(true);
    try {
      // Usamos a rota ADMIN de listagem de pedidos
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      alert('Não foi possível carregar a fila de pedidos.');
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Função para ATUALIZAR o status de um pedido
  async function handleUpdateStatus(orderId: string, newStatus: string) {
    try {
      // Usamos a rota ADMIN de atualização de status
      await api.patch(`/admin/orders/${orderId}`, {
        status: newStatus,
      });
      // Atualiza o estado localmente (para resposta visual rápida)
      // ou busca tudo de novo (fetchOrders())
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
      alert('Status do pedido atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Falha ao atualizar status do pedido.');
    }
  }

  // Busca os dados iniciais
  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Renderização (JSX) ---
  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Fila de Pedidos
      </h1>

      {isLoading ? (
        <p className="dark:text-white">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="dark:text-zinc-400">Nenhum pedido encontrado.</p>
      ) : (
        // Layout em colunas (estilo Kanban/Trello)
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col rounded-lg bg-white p-5 shadow-md dark:bg-zinc-800"
            >
              {/* Cabeçalho do Cartão */}
              <div className="mb-4 border-b pb-3 dark:border-zinc-700">
                <h2 className="font-semibold dark:text-white">
                  Pedido de: {order.user.name}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {order.user.phone}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              {/* Itens do Pedido */}
              <ul className="flex-1 space-y-2">
                {order.items.map((orderItem) => (
                  <li
                    key={orderItem.id}
                    className="flex justify-between text-sm dark:text-zinc-200"
                  >
                    <span>
                      {orderItem.quantity}x {orderItem.item.description}
                    </span>
                    <span className="font-medium">
                      {(
                        orderItem.item.unitPrice * orderItem.quantity
                      ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Rodapé do Cartão */}
              <div className="mt-4 border-t pt-4 dark:border-zinc-700">
                <div className="mb-3 flex justify-between font-bold dark:text-white">
                  <span>Total:</span>
                  <span>{calculateOrderTotal(order.items)}</span>
                </div>
                <div className="mb-4 flex justify-between text-sm dark:text-zinc-300">
                  <span>Pagamento:</span>
                  <span className="font-medium">
                    {paymentMethodLabels[order.paymentMethod]}
                  </span>
                </div>

                {/* Seletor de Status */}
                <div>
                  <label
                    htmlFor={`status-${order.id}`}
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Alterar Status:
                  </label>
                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}