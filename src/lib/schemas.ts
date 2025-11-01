import { z } from 'zod';

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