import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/schemas';
import { headers } from 'next/headers';

// POST (CREATE ORDER) - Rota protegida para CLIENTES
export async function POST(req: NextRequest) {
  try {
    // 1. Pegar o ID do usuário (injetado pelo middleware)
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário não encontrado.' },
        { status: 401 },
      );
    }

    // 2. Validar o corpo da requisição
    const body = await req.json();
    const { paymentMethod, items } = createOrderSchema.parse(body);

    // 3. Iniciar uma Transação Prisma
    // Isso garante que ou tudo (Order + OrderItems) é criado, ou nada é.
    const newOrder = await prisma.$transaction(async (tx) => {
      // 3a. Criar o Pedido (Order)
      const order = await tx.order.create({
        data: {
          userId: userId, // ID do cliente logado
          paymentMethod: paymentMethod,
          status: 'PENDING', // Status inicial padrão
        },
      });

      // 3b. Preparar os Itens do Pedido (OrderItems)
      const orderItemsData = items.map((item) => ({
        orderId: order.id,
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      // 3c. Salvar os Itens do Pedido no banco
      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      return order; // Retorna o pedido principal
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    // Erro do Prisma (ex: itemId não existe)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: 'Um dos itens informados não existe.' },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}

// GET (READ MY ORDERS) - Rota protegida para CLIENTES
export async function GET() {
  try {
    // 1. Pegar o ID do usuário (injetado pelo middleware)
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário não encontrado.' },
        { status: 401 },
      );
    }

    // 2. Buscar pedidos do usuário logado
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc', // Mais recentes primeiro
      },
      // Incluir os detalhes dos itens de cada pedido
      include: {
        items: { //
          include: {
            item: { //
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