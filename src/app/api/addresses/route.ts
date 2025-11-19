// Em: src/app/api/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { addressSchema } from '@/lib/schemas';
import { headers } from 'next/headers';

// GET: Listar endereços do usuário logado
export async function GET() {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

// POST: Criar novo endereço
export async function POST(req: NextRequest) {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const data = addressSchema.parse(body);

    const address = await prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}