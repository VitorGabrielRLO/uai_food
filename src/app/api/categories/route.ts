import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @openapi
 * /api/categories:
 * get:
 * tags:
 * - Cardápio
 * summary: Lista todas as categorias
 * description: Retorna todas as categorias cadastradas em ordem alfabética.
 * responses:
 * 200:
 * description: Lista de categorias recuperada com sucesso.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: string
 * description:
 * type: string
 * example: "Pizzas"
 * 500:
 * description: Erro interno do servidor.
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        description: 'asc',
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