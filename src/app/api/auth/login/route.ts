import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validar os dados de entrada
    const { phone, password } = loginSchema.parse(body);

    // 2. Buscar o usuário pelo telefone
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // 404 Not Found: Usuário não encontrado
      return NextResponse.json(
        { message: 'Telefone ou senha inválidos.' },
        { status: 404 },
      );
    }

    // 3. Comparar a senha enviada com o hash salvo no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // 401 Unauthorized: Senha incorreta
      return NextResponse.json(
        { message: 'Telefone ou senha inválidos.' },
        { status: 401 },
      );
    }

    // 4. Gerar o Token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não está definido no .env');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        userType: user.userType, //
      },
      secret,
      {
        expiresIn: '1d', // Token expira em 1 dia
      },
    );

    // 5. Retornar o token para o cliente
    // (Também removemos a senha da resposta)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    // Erro de validação do Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 },
      );
    }

    // Outros erros
    console.error(error); // Log do erro no servidor
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}