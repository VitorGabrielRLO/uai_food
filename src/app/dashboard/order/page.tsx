'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Item, PaymentMethod, Address } from '@prisma/client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

// Tipo para o Item com a categoria
type ItemWithCategory = Item & {
  category: {
    description: string;
  };
};

// --- Componente do Cardápio (Menu) ---
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
          <h2 className="mb-4 text-2xl font-bold text-zinc-800 dark:text-white border-l-4 border-blue-600 pl-3">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700"
              >
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {item.description}
                  </h3>
                  <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
                    {item.unitPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    addItem(item);
                    toast.success(`${item.description} adicionado!`);
                  }}
                  className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors active:scale-95"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// --- Componente do Carrinho (Cart) ---
function Cart() {
  const {
    items,
    removeItem,
    updateItemQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  
  // Novos estados para endereço
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Busca os endereços do usuário ao carregar o carrinho
  useEffect(() => {
    api.get('/addresses')
      .then((response) => {
        setAddresses(response.data);
        // Se tiver endereços, seleciona o primeiro automaticamente
        if (response.data.length > 0) {
          setSelectedAddressId(response.data[0].id);
        }
      })
      .catch(() => toast.error('Erro ao buscar endereços.'));
  }, []);

  async function handleFinishOrder() {
    if (items.length === 0) {
      toast.warning('Seu carrinho está vazio.');
      return;
    }

    // Validação de endereço
    if (!selectedAddressId) {
      toast.error('Por favor, selecione ou cadastre um endereço de entrega.');
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      paymentMethod: paymentMethod,
      addressId: selectedAddressId, // Enviando o endereço selecionado
      items: items.map(cartItem => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
      })),
    };

    try {
      await api.post('/orders', payload);
      
      toast.success('Pedido realizado com sucesso!');
      clearCart(); 
      router.push('/dashboard/my-orders'); 
      
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      const msg = error.response?.data?.message || 'Tente novamente.';
      toast.error(`Falha ao registrar o pedido: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 sticky top-20">
      <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
        🛒 Meu Carrinho
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">
            Seu carrinho está vazio.
          </p>
          <p className="text-sm text-zinc-400">Adicione itens do cardápio ao lado.</p>
        </div>
      ) : (
        <>
          {/* Lista de Itens */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {items.map((cartItem) => (
              <div
                key={cartItem.item.id}
                className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-700 last:border-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-zinc-900 dark:text-white">
                    {cartItem.item.description}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cartItem.item.unitPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })} un.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateItemQuantity(cartItem.item.id, cartItem.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
                  >-</button>
                  <span className="text-sm font-medium w-4 text-center dark:text-white">{cartItem.quantity}</span>
                  <button 
                    onClick={() => updateItemQuantity(cartItem.item.id, cartItem.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
                  >+</button>
                </div>
                
                <button
                  onClick={() => removeItem(cartItem.item.id)}
                  className="ml-3 text-red-500 hover:text-red-700"
                  title="Remover item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-zinc-100 dark:border-zinc-700 space-y-4">
            
            {/* SELEÇÃO DE ENDEREÇO */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                📍 Endereço de Entrega
              </label>
              {addresses.length === 0 ? (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100 dark:bg-red-900/20 dark:border-red-900">
                  Você não tem endereços cadastrados. <br/>
                  <Link href="/dashboard/addresses" className="underline font-bold">Clique aqui para cadastrar.</Link>
                </div>
              ) : (
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.street}, {addr.number} - {addr.district}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                💳 Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="PIX">PIX</option>
                <option value="CASH">Dinheiro</option>
                <option value="CREDIT">Crédito</option>
                <option value="DEBIT">Débito</option>
              </select>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-2">
              <span className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Total:</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalPrice.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={handleFinishOrder}
              disabled={isSubmitting || addresses.length === 0}
              className="w-full rounded-lg bg-green-600 px-5 py-3 text-center text-base font-bold text-white hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar Pedido ✅'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// --- Página Principal ---
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
      toast.error('Não foi possível carregar o cardápio.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <p className="text-lg text-zinc-500 dark:text-zinc-400 animate-pulse">Carregando cardápio delicioso...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Coluna do Cardápio (2/3) */}
        <div className="lg:col-span-2">
          <Menu itemsByCategory={itemsByCategory} />
        </div>

        {/* Coluna do Carrinho (1/3) - Fixa no topo */}
        <div className="relative">
          <Cart />
        </div>
      </div>
    </div>
  );
}