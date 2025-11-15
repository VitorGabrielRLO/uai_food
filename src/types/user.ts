// Em: src/types/user.ts
// (Tipos manuais para evitar importar o @prisma/client no frontend)

export type UserType = "CLIENT" | "ADMIN";

export type PaymentMethod = "CASH" | "DEBIT" | "CREDIT" | "PIX";

export type User = {
  id: string;
  name: string;
  phone: string;
  userType: UserType;
  createdAt: string; 
  updatedAt: string;
};

export type Category = {
  id: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Item = {
  id: string;
  description: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
};