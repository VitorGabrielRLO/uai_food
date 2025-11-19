// Em: src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // <-- CORRIGIDO
import './globals.css';
import { AuthProvider } from '@/context/AuthContext'; // 1. Importar o Provedor

const inter = Inter({ // <-- CORRIGIDO
  variable: '--font-sans', // <-- CORRIGIDO
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ // <-- CORRIGIDO
  variable: '--font-mono', // <-- CORRIGIDO
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'UAIFood',
  description: 'Gestão de pedidos UAIFood',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`} // <-- CORRIGIDO
      >
        {/* 2. ESTA LINHA É A CORREÇÃO CRÍTICA */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}