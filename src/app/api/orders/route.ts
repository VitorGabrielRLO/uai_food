import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/schemas';
import { headers } from 'next/headers';

/**
 * @openapi
 * /api/orders:
 * post:
 * tags:
 * - Pedidos (Cliente)
 * summary: Cria um novo pedido
 * description: Cria um pedido para o usuário logado com os itens selecionados. Requer autenticação.
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - paymentMethod
 * - items
 * properties:
 * paymentMethod:
 * type: string
 * enum: [CASH, DEBIT, CREDIT, PIX]
 * example: "PIX"
 * items:
 * type: array
 * minItems: 1
 * items:
 * type: object
 * required:
 * - itemId
 * - quantity
 * properties:
 * itemId:
 * type: string
 * description: ID do item no banco de dados
 * quantity:
 * type: integer
 * minimum: 1
 * example: 2
 * responses:
 * 201:
 * description: Pedido criado com sucesso.
 * 400:
 * description: Dados inválidos ou item não encontrado.
 * 401:
 * description: Usuário não autenticado.
 * 500:
 * description: Erro interno do servidor.
 *
 * get:
 * tags:
 * - Pedidos (Cliente)
 * summary: Lista os pedidos do usuário
 * description: Retorna o histórico de pedidos do usuário logado. Requer autenticação.
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Lista de pedidos recuperada com sucesso.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: string
 * status:
 * type: string
 * example: "PENDING"
 * paymentMethod:
 * type: string
 * createdAt:
 * type: string
 * format: date-time
 * items:
 * type: array
 * items:
 * type: object
 * properties:
 * quantity:
 * type: integer
 * item:
 * type: object
 * properties:
 * description:
 * type: string
 * unitPrice:
 * type: number
 * 401:
 * description: Usuário não autenticado.
 * 500:
 * description: Erro interno do servidor.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Auth required' }, { status: 401 });

    const body = await req.json();
    // Valida o addressId
    const { paymentMethod, items, addressId } = createOrderSchema.parse(body);

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId,
          paymentMethod: paymentMethod,
          status: 'PENDING',
          addressId: addressId, // <--- SALVA O ENDEREÇO
        },
      });

      // ... (lógica de criar items igual a antes)
      const orderItemsData = items.map((item) => ({
        orderId: order.id,
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      await tx.orderItem.createMany({ data: orderItemsData });

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
     // ... (tratamento de erro igual a antes)
     return NextResponse.json({ message: 'Erro' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário não encontrado.' },
        { status: 401 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            item: {
              select: {
                description: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}