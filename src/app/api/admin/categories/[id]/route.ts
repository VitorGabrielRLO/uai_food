import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { updateCategorySchema } from '@/lib/schemas';
import { Prisma } from '@prisma/client';

// PATCH (UPDATE)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { id } = params;

    // 1. Validar os dados
    const data = updateCategorySchema.parse(body);

    // 2. Atualizar no banco
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    // Erro do Prisma: P2025 = "Record not found" (ID não existe)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Categoria não encontrada.' },
        { status: 404 },
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

    // 1. Deletar do banco
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 }); // 204 No Content (Sucesso)
  } catch (error) {
    // Erro do Prisma: P2025 = "Record not found" (ID não existe)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Categoria não encontrada.' },
        { status: 404 },
      );
    }
    // Erro do Prisma: P2003 = Foreign key constraint failed
    // (Não pode deletar pois existem Itens ligados a esta categoria)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: 'Não é possível deletar esta categoria, pois existem itens associados a ela.' },
        { status: 409 }, // 409 Conflict
      );
    }
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}