import { Order, OrderItem, Item, User } from '@prisma/client';

// Este tipo representa um OrderItem que também
// inclui os detalhes do Item associado
export type DetailedOrderItem = OrderItem & {
  item: Pick<Item, 'description' | 'unitPrice'>; //
};

// Este é o tipo principal da nossa página:
// Um Pedido (Order) que inclui os detalhes do Usuário
// e uma lista de Itens de Pedido Detalhados
export type DetailedOrder = Order & {
  user: Pick<User, 'name' | 'phone'>; //
  items: DetailedOrderItem[]; //
};