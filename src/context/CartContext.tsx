// Em: src/context/CartContext.tsx
'use client';

import { createContext, ReactNode, useState, useContext } from 'react';
import { Item } from '@prisma/client';

// Tipo para o item dentro do carrinho
export type CartItem = {
  item: Item;
  quantity: number;
};

// Tipo para os dados que o contexto vai fornecer
interface CartContextType {
  items: CartItem[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext({} as CartContextType);

// Provedor do Contexto
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalItems = items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  const totalPrice = items.reduce(
    (sum, cartItem) => sum + cartItem.item.unitPrice * cartItem.quantity,
    0,
  );

  // Adiciona um item ao carrinho (ou incrementa a quantidade se já existir)
  function addItem(itemToAdd: Item) {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem.item.id === itemToAdd.id,
      );

      if (existingItem) {
        // Se já existe, apenas incrementa a quantidade
        return prevItems.map((cartItem) =>
          cartItem.item.id === itemToAdd.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      } else {
        // Se é novo, adiciona ao array
        return [...prevItems, { item: itemToAdd, quantity: 1 }];
      }
    });
  }

  // Remove um item completamente do carrinho
  function removeItem(itemId: string) {
    setItems((prevItems) =>
      prevItems.filter((cartItem) => cartItem.item.id !== itemId),
    );
  }

  // Atualiza a quantidade de um item (ex: 1, 2, 3...)
  function updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      // Se a quantidade for 0 ou menos, remove o item
      removeItem(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem,
      ),
    );
  }

  // Limpa o carrinho (usado após finalizar o pedido)
  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export const useCart = () => {
  return useContext(CartContext);
};