import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET (READ ALL ORDERS) - Rota protegida para ADMINS
export async function GET() {
  try {
    // Nosso middleware já garantiu que este é um ADMIN
    
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc', // Mais recentes primeiro
      },
      // Incluir quem foi o cliente e quais itens ele pediu
      include: {
        user: { //
          select: {
            name: true,
            phone: true,
          },
        },
        address: true,
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