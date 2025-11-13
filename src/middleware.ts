import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { UserType } from '@prisma/client'; // Importando o enum do Prisma

// 1. Pega a sua chave secreta do .env e a codifica
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  // 2. Pega o token do header 'Authorization'
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split('Bearer ')[1]; // Formato "Bearer TOKEN..."

  if (!token) {
    // 3. Se não houver token, retorna erro 401
    return new NextResponse(
      JSON.stringify({ message: 'Autenticação necessária.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    // 4. Verifica se o token é válido usando 'jose'
    const { payload } = await jwtVerify(token, secret);

    // 5. Verifica se é rota de ADMIN
    const { pathname } = req.nextUrl;
    const userType = payload.userType as UserType; //

    if (pathname.startsWith('/api/admin') && userType !== 'ADMIN') { //
      // 6. Se for rota de admin e o usuário não for, retorna 403
      return new NextResponse(
        JSON.stringify({ message: 'Acesso não autorizado.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // 7. (Opcional, mas recomendado) Adiciona os dados do usuário nos headers
    // da requisição, para a rota de API ter acesso fácil a eles.
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-user-type', userType);
    headers.set('x-user-phone', payload.phone as string);

    // 8. Deixa a requisição continuar com os novos headers
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  } catch (err) {
    // 9. Se o token for inválido ou expirado
    return new NextResponse(
      JSON.stringify({ message: 'Token inválido ou expirado.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

// 10. Configuração do "Matcher"
export const config = {
  // O middleware só vai rodar nas rotas que baterem com esses caminhos
  matcher: [
    '/api/admin/:path*', // Todas as rotas de admin
    '/api/orders/:path*', // Rotas de pedidos
    // Adicione outras rotas protegidas aqui
  ],
};