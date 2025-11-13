import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

// Schema para o registro de usuário (JÁ EXISTE)
export const registerSchema = z.object({
  name: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres',
  }),
  phone: z.string().min(10, {
    message: 'O telefone deve ter pelo menos 10 dígitos (ex: 34999998888)',
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres',
  }),
});

// ADICIONE ESTE NOVO SCHEMA
export const loginSchema = z.object({
  phone: z.string().min(10, {
    message: 'O telefone é obrigatório',
  }),
  password: z.string().min(6, {
    message: 'A senha é obrigatória',
  }),
});

export const categorySchema = z.object({
  description: z.string().min(3, {
    message: 'A descrição deve ter pelo menos 3 caracteres',
  }),
});

export const itemSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória.'),
  unitPrice: z.number().positive('O preço deve ser um número positivo.'),
  categoryId: z.string().cuid('A Categoria é obrigatória.'), // CUID é o formato do ID do Prisma
});

export const updateCategorySchema = categorySchema.partial(); // Todos os campos de categorySchema se tornam opcionais
export const updateItemSchema = itemSchema.partial(); // Todos os campos de itemSchema se tornam opcionais

const orderItemSchema = z.object({
  itemId: z.string().cuid('ID do item inválido'),
  quantity: z.number().int().positive('A quantidade deve ser pelo menos 1'),
});

// Schema para a criação de um novo pedido (feito pelo CLIENTE)
export const createOrderSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod, { // Valida contra o Enum do Prisma
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  // O pedido deve ter pelo menos um item
  items: z.array(orderItemSchema).min(1, 'O pedido deve ter pelo menos um item'),
});

// Schema para atualização de status (feito pelo ADMIN)
export const updateOrderStatusSchema = z.object({
  status: z.string().min(3, 'O status é obrigatório'), // Ex: "CONFIRMED", "IN_DELIVERY", etc.
});