// Em: src/app/dashboard/my-orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { DetailedOrder } from '@/types/order'; //
import { PaymentMethod } from '@prisma/client';

// --- Funções Auxiliares (Helpers) ---
// (Podemos reutilizar as mesmas funções da página de admin)

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

// Mapeia os status para cores (opcional, mas ajuda na UI)
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  IN_DELIVERY: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  CANCELED: 'bg-red-500',
};

// --- Componente da Página ---
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Função para buscar os pedidos do CLIENTE
  async function fetchMyOrders() {
    setIsLoading(true);
    try {
      // Usamos a rota de CLIENTE de listagem de pedidos
      // O middleware vai garantir que só peguemos os pedidos deste usuário
      const response = await api.get('/orders'); //
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      alert('Não foi possível carregar seus pedidos.');
    } finally {
      setIsLoading(false);
    }
  }

  // Busca os dados iniciais
  useEffect(() => {
    fetchMyOrders();
  }, []);

  // --- Renderização (JSX) ---
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">
        Meus Pedidos
      </h1>

      {isLoading ? (
        <p className="dark:text-white">Carregando seus pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="dark:text-zinc-400">Você ainda não fez nenhum pedido.</p>
      ) : (
        // Layout em lista
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg bg-white p-5 shadow-md dark:bg-zinc-800"
            >
              {/* Cabeçalho do Pedido */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3 dark:border-zinc-700">
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    Pedido #{order.id.substring(0, 8)}...
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Feito em: {formatDate(order.createdAt)}
                  </p>
                </div>
                {/* Tag de Status */}
                <div
                  className={`rounded-full px-3 py-1 text-sm font-medium text-white ${
                    statusColors[order.status] || 'bg-zinc-500'
                  }`}
                >
                  {order.status}
                </div>
              </div>

              {/* Itens do Pedido */}
              <ul className="mb-4 space-y-2">
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

              {/* Rodapé do Pedido */}
              <div className="border-t pt-4 dark:border-zinc-700">
                <div className="mb-2 flex justify-between text-sm dark:text-zinc-300">
                  <span>Pagamento:</span>
                  <span className="font-medium">
                    {paymentMethodLabels[order.paymentMethod]}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold dark:text-white">
                  <span>Total:</span>
                  <span>{calculateOrderTotal(order.items)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}