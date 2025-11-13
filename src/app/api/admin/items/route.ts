import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { itemSchema } from '@/lib/schemas';

// POST (CREATE)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validar
    const { description, unitPrice, categoryId } = itemSchema.parse(body);

    // 2. Criar o item
    // O Prisma vai falhar automaticamente se o 'categoryId' não existir,
    // o que garante que a categoria é válida.
    const item = await prisma.item.create({
      data: {
        description,
        unitPrice,
        categoryId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 },
      );
    }
    
    // Erro específico se a categoria (foreign key) não for encontrada
    if (error.code === 'P2003') {
       return NextResponse.json(
        { message: 'A categoria informada não existe.' },
        { status: 400 },
      );
    }
    
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}