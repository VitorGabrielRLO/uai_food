// Em: src/app/api-doc/page.tsx
import { getSwaggerSpec } from '@/lib/swagger';
import ReactSwagger from './swagger-ui';

// Esta página será renderizada no lado do servidor
export default async function ApiDocPage() {
  // Gera a especificação no servidor
  const spec = await getSwaggerSpec();

  return (
    <section className="container mx-auto py-8">
      {/* Passa a especificação para o componente de cliente */}
      <ReactSwagger spec={spec} />
    </section>
  );
}