import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma'; // Nosso alias do tsconfig.json
import { registerSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validar os dados recebidos com Zod
    const { name, phone, password } = registerSchema.parse(body);

    // 2. Verificar se o telefone já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { phone: phone },
    });

    if (existingUser) {
      // 409 Conflict: Recurso já existe
      return NextResponse.json(
        { message: 'Este telefone já está cadastrado.' },
        { status: 409 },
      );
    }

    // 3. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Salvar o novo usuário no banco
    const user = await prisma.user.create({
      data: {
        name: name,
        phone: phone,
        password: hashedPassword, //
        // userType será CLIENT por padrão, como definido no schema.prisma
      },
    });

    // 5. Retornar uma resposta de sucesso (sem a senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // 201 Created: Recurso criado com sucesso
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    // Se o erro for do Zod (validação falhou)
    if (error instanceof z.ZodError) {
      // 400 Bad Request: Dados inválidos
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 },
      );
    }

    // Outros erros (ex: falha ao conectar no banco)
    // 500 Internal Server Error
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}