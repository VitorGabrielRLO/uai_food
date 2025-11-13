import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/schemas';

// POST (CREATE)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validar
    const { description } = categorySchema.parse(body);

    // 2. Verificar se já existe (campo 'description' é @unique)
    const existingCategory = await prisma.category.findUnique({
      where: { description },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Esta categoria já existe.' },
        { status: 409 }, // Conflict
      );
    }

    // 3. Criar
    const category = await prisma.category.create({
      data: {
        description,
      },
    });

    return NextResponse.json(category, { status: 201 }); // 201 Created
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