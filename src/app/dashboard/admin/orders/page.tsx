'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { DetailedOrder } from '@/types/order';
import { PaymentMethod } from '@/types/user';

// --- Funções Auxiliares ---

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

function calculateOrderTotal(items: DetailedOrder['items']) {
  const total = items.reduce((sum, orderItem) => {
    return sum + orderItem.item.unitPrice * orderItem.quantity;
  }, 0);

  return total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  PIX: 'PIX',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  IN_DELIVERY: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  CANCELED: 'bg-red-500',
};

// --- Componente da Página ---
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_DELIVERY', 'DELIVERED', 'CANCELED'];

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      alert('Não foi possível carregar a fila de pedidos.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    try {
      await api.patch(`/admin/orders/${orderId}`, {
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
      alert('Status atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Falha ao atualizar status.');
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Fila de Pedidos
      </h1>

      {isLoading ? (
        <p className="dark:text-white">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="dark:text-zinc-400">Nenhum pedido encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col rounded-lg bg-white p-5 shadow-md dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            >
              {/* Cabeçalho */}
              <div className="mb-4 border-b border-zinc-100 pb-3 dark:border-zinc-700">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold text-lg dark:text-white">
                    {order.user.name}
                  </h2>
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${statusColors[order.status] || 'bg-gray-500'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {order.user.phone}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatDate(order.createdAt)}
                </p>
                
                {/* --- EXIBIÇÃO DO ENDEREÇO --- */}
                <div className="mt-3 bg-zinc-50 dark:bg-zinc-900 p-2 rounded text-sm">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Entrega:</p>
                  {order.address ? (
                    <p className="text-zinc-600 dark:text-zinc-400 leading-tight">
                      {order.address.street}, {order.address.number}<br/>
                      {order.address.district} - {order.address.city}/{order.address.state}
                    </p>
                  ) : (
                    <p className="text-yellow-600 text-xs italic">Retirada / Sem endereço</p>
                  )}
                </div>
              </div>

              {/* Itens */}
              <ul className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-40">
                {order.items.map((orderItem) => (
                  <li
                    key={orderItem.id}
                    className="flex justify-between text-sm dark:text-zinc-200 border-b border-zinc-50 dark:border-zinc-700/50 pb-1 last:border-0"
                  >
                    <span>
                      <span className="font-bold">{orderItem.quantity}x</span> {orderItem.item.description}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {(orderItem.item.unitPrice * orderItem.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Rodapé */}
              <div className="mt-auto border-t pt-3 dark:border-zinc-700">
                <div className="mb-2 flex justify-between font-bold text-lg dark:text-white">
                  <span>Total:</span>
                  <span>{calculateOrderTotal(order.items)}</span>
                </div>
                <div className="mb-4 flex justify-between text-sm dark:text-zinc-300">
                  <span>Pagamento:</span>
                  <span className="font-medium">
                    {paymentMethodLabels[order.paymentMethod]}
                  </span>
                </div>

                {/* Alterar Status */}
                <div>
                  <label
                    htmlFor={`status-${order.id}`}
                    className="mb-1 block text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    Atualizar Status
                  </label>
                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white cursor-pointer"
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