import { z } from 'zod';
// REMOVIDA a importação do @prisma/client

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
  categoryId: z.string().cuid('A Categoria é obrigatória.'),
});

export const updateCategorySchema = categorySchema.partial();
export const updateItemSchema = itemSchema.partial();

const orderItemSchema = z.object({
  itemId: z.string().cuid('ID do item inválido'),
  quantity: z.number().int().positive('A quantidade deve ser pelo menos 1'),
});

// CORREÇÃO AQUI: Usamos z.enum com os valores manuais
export const createOrderSchema = z.object({
  paymentMethod: z.enum(['CASH', 'DEBIT', 'CREDIT', 'PIX'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  addressId: z.string().cuid('Selecione um endereço válido'), // <--- NOVO CAMPO
  items: z.array(orderItemSchema).min(1, 'O pedido deve ter pelo menos um item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(3, 'O status é obrigatório'),
});

// Em: src/lib/schemas.ts

export const addressSchema = z.object({
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  district: z.string().min(3, 'Bairro é obrigatório'),
  city: z.string().min(3, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras (ex: MG)'),
  zipCode: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
});