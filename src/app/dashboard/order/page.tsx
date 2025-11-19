'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Item, PaymentMethod } from '@prisma/client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // <-- Importando o toast

// Tipo para o Item com a categoria
type ItemWithCategory = Item & {
  category: {
    description: string;
  };
};

// --- Componente do Cardápio ---
function Menu({
  itemsByCategory,
}: {
  itemsByCategory: Record<string, ItemWithCategory[]>;
}) {
  const { addItem } = useCart();

  return (
    <div className="space-y-8">
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-4 text-2xl font-bold dark:text-white">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-white p-4 shadow-md dark:bg-zinc-800"
              >
                <h3 className="text-lg font-semibold dark:text-white">
                  {item.description}
                </h3>
                <p className="mb-2 text-green-600 dark:text-green-400">
                  {item.unitPrice.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <button
                  onClick={() => {
                    addItem(item);
                    toast.success(`${item.description} adicionado!`); // <-- Feedback visual
                  }}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// --- Componente do Carrinho ---
function Cart() {
  const {
    items,
    removeItem,
    updateItemQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleFinishOrder() {
    if (items.length === 0) {
      toast.warning('Seu carrinho está vazio.'); // <-- Toast
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      paymentMethod: paymentMethod,
      items: items.map(cartItem => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
      })),
    };

    try {
      await api.post('/orders', payload);
      
      toast.success('Pedido realizado com sucesso!'); // <-- Toast de sucesso
      clearCart(); 
      router.push('/dashboard/my-orders'); 
      
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      const msg = error.response?.data?.message || 'Tente novamente.';
      toast.error(`Falha ao registrar o pedido: ${msg}`); // <-- Toast de erro
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-800">
      <h2 className="mb-4 text-2xl font-bold dark:text-white">Meu Carrinho</h2>
      {items.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          Seu carrinho está vazio.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((cartItem) => (
              <div
                key={cartItem.item.id}
                className="flex items-center justify-between border-b pb-2 dark:border-zinc-700"
              >
                <div>
                  <h3 className="font-semibold dark:text-white">
                    {cartItem.item.description}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {cartItem.item.unitPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={cartItem.quantity}
                    onChange={(e) =>
                      updateItemQuantity(
                        cartItem.item.id,
                        parseInt(e.target.value, 10),
                      )
                    }
                    className="w-16 rounded-md border border-zinc-300 bg-zinc-50 p-1.5 text-center text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  />
                  <button
                    onClick={() => removeItem(cartItem.item.id)}
                    className="rounded-md bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-4 flex justify-between text-lg font-bold dark:text-white">
              <span>Total:</span>
              <span>
                {totalPrice.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>

            <div className="mb-4">
              <label
                htmlFor="paymentMethod"
                className="mb-2 block text-sm font-medium"
              >
                Forma de Pagamento
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="PIX">PIX</option>
                <option value="CASH">Dinheiro</option>
                <option value="CREDIT">Crédito</option>
                <option value="DEBIT">Débito</option>
              </select>
            </div>

            <button
              onClick={handleFinishOrder}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-600 px-5 py-3 text-center text-base font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando Pedido...' : 'Finalizar Pedido'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// --- Componente da Página Principal ---
export default function OrderPage() {
  const [itemsByCategory, setItemsByCategory] = useState<
    Record<string, ItemWithCategory[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  async function fetchMenu() {
    try {
      const response = await api.get<ItemWithCategory[]>('/items'); 
      const items = response.data;

      const grouped = items.reduce(
        (acc, item) => {
          const categoryName = item.category.description;
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(item);
          return acc;
        },
        {} as Record<string, ItemWithCategory[]>,
      );

      setItemsByCategory(grouped);
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      toast.error('Não foi possível carregar o cardápio.'); // <-- Toast
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  if (isLoading) {
    return (
      <p className="text-center dark:text-white">Carregando cardápio...</p>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Menu itemsByCategory={itemsByCategory} />
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          <Cart />
        </div>
      </div>
    </div>
  );
}