import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET (READ ALL)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        description: 'asc', // Ordenar por ordem alfabética
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}