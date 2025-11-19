import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @openapi
 * /api/items:
 * get:
 * tags:
 * - Cardápio
 * summary: Lista todos os itens do cardápio
 * description: Retorna todos os itens cadastrados, incluindo a descrição da categoria de cada um.
 * responses:
 * 200:
 * description: Lista de itens recuperada com sucesso.
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
 * example: "Pizza Calabresa"
 * unitPrice:
 * type: number
 * format: float
 * example: 45.50
 * categoryId:
 * type: string
 * category:
 * type: object
 * properties:
 * description:
 * type: string
 * example: "Pizzas"
 * 500:
 * description: Erro interno do servidor.
 */
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        category: {
          select: {
            description: true,
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