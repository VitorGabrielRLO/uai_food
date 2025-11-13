import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { updateItemSchema } from '@/lib/schemas';
import { Prisma } from '@prisma/client';

// PATCH (UPDATE)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { id } = params;

    // 1. Validar
    const data = updateItemSchema.parse(body);

    // 2. Atualizar
    const updatedItem = await prisma.item.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    // Erro do Prisma: P2025 = "Record not found" (ID não existe)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Item não encontrado.' },
        { status: 404 },
      );
    }
    // Erro P2003: Se tentar mudar o categoryId para um que não existe
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

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // 1. Deletar
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 }); // 204 No Content
  } catch (error) {
    // Erro do Prisma: P2025 = "Record not found" (ID não existe)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Item não encontrado.' },
        { status: 404 },
      );
    }
    // Erro do Prisma: P2003 = Foreign key constraint failed
    // (Não pode deletar pois existem OrderItems ligados a este item)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: 'Não é possível deletar este item, pois ele faz parte de pedidos existentes.' },
        { status: 409 }, // 409 Conflict
      );
    }
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}