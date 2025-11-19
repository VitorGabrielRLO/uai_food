import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/schemas';

/**
 * @openapi
 * /api/auth/register:
 * post:
 * tags:
 * - Autenticação
 * summary: Registra um novo usuário (Cliente)
 * description: Cria uma nova conta de usuário com perfil de CLIENTE.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - phone
 * - password
 * properties:
 * name:
 * type: string
 * example: "João da Silva"
 * phone:
 * type: string
 * description: Telefone com DDD (apenas números ou com formatação)
 * example: "34999998888"
 * password:
 * type: string
 * format: password
 * minLength: 6
 * example: "senha123"
 * responses:
 * 201:
 * description: Usuário criado com sucesso.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * id:
 * type: string
 * name:
 * type: string
 * phone:
 * type: string
 * userType:
 * type: string
 * example: "CLIENT"
 * createdAt:
 * type: string
 * format: date-time
 * 400:
 * description: Dados inválidos enviados.
 * 409:
 * description: Telefone já cadastrado.
 * 500:
 * description: Erro interno do servidor.
 */
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
        password: hashedPassword,
      },
    });

    // 5. Retornar uma resposta de sucesso (sem a senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}