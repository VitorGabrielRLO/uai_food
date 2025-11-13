import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { updateOrderStatusSchema } from '@/lib/schemas';
import { Prisma } from '@prisma/client';

// PATCH (UPDATE ORDER STATUS) - Rota protegida para ADMINS
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { id } = params;

    // 1. Validar
    const { status } = updateOrderStatusSchema.parse(body);

    // 2. Atualizar o status do pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    // Erro do Prisma: P2025 = "Record not found" (ID do pedido não existe)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Pedido não encontrado.' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}