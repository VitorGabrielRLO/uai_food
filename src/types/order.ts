// CORREÇÃO AQUI: Importa NOSSOS tipos, não os do Prisma
import { Item, User, PaymentMethod } from './user';

// Tipo base para Order (privado para este módulo)
type OrderBase = {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

// Tipo base para OrderItem (privado para este módulo)
type OrderItemBase = {
  id: string;
  quantity: number;
  orderId: string;
  itemId: string;
};

// --- Tipos Exportados ---

// Item de Pedido Detalhado (para mostrar no carrinho/fila)
export type DetailedOrderItem = {
  id: string;
  quantity: number;
  orderId: string;
  itemId: string;
  item: Pick<Item, 'description' | 'unitPrice'>;
};

// Pedido Detalhado (para a fila do admin e "meus pedidos")
export type DetailedOrder = {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  createdAt: string; // ou Date, dependendo de como vem do JSON
  updatedAt: string;
  userId: string;
  user: Pick<User, 'name' | 'phone'>;
  address?: Address | null; // <--- NOVO CAMPO
  items: DetailedOrderItem[];
};