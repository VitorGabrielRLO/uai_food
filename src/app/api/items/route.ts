import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET (READ ALL)
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      // Usamos 'include' para trazer os dados da categoria junto
      include: {
        category: {
          select: {
            description: true, //
          },
        },
      },
      orderBy: {
        description: 'asc',
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}