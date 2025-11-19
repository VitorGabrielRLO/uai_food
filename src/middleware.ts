import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { UserType } from '@prisma/client';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  let token = authHeader?.split('Bearer ')[1];

  // Se não tem no header (API), tenta pegar do cookie (Frontend) se você estiver usando cookies,
  // mas no seu caso atual (localStorage), o middleware não acessa o localStorage.
  // POREM, para proteger rotas de frontend no Next.js via middleware, o ideal é usar Cookies.
  
  // Como sua arquitetura usa localStorage, a proteção de rota frontend deve ser feita no client-side
  // ou mudarmos para cookies.
  
  // VAMOS MANTER A PROTEÇÃO DE API QUE É A MAIS IMPORTANTE:
  if (!token) {
    // Se for rota de API, retorna JSON
    if (req.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({ message: 'Autenticação necessária.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
    // Se for rota de página (dashboard), não fazemos nada aqui pois o AuthContext cuida do redirect
    // ou redirecionamos para login se conseguíssemos ler o token (que não conseguimos se estiver no localStorage)
  }

  try {
    if (token) {
        const { payload } = await jwtVerify(token, secret);
        const userType = payload.userType as UserType;
        
        // Lógica de proteção de rota API (JÁ EXISTENTE)
        if (req.nextUrl.pathname.startsWith('/api/admin') && userType !== 'ADMIN') {
            return new NextResponse(
                JSON.stringify({ message: 'Acesso não autorizado.' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } },
            );
        }

        const headers = new Headers(req.headers);
        headers.set('x-user-id', payload.userId as string);
        headers.set('x-user-type', userType);
        headers.set('x-user-phone', payload.phone as string);

        return NextResponse.next({
            request: {
                headers: headers,
            },
        });
    }
  } catch (err) {
      if (req.nextUrl.pathname.startsWith('/api')) {
        return new NextResponse(
            JSON.stringify({ message: 'Token inválido.' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
        );
      }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*', 
    '/api/orders/:path*',
  ],
};