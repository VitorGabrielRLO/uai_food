// Em: src/lib/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UAIFood API',
      version: '1.0.0',
      description: 'Documentação da API do sistema de delivery UAIFood',
    },
    // Opcional: Adicionar definições de segurança (para o token JWT)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Caminho para os arquivos da API onde estão os comentários @openapi
  apis: ['./src/app/api/**/route.ts'],
};

export const getSwaggerSpec = () => {
  return swaggerJsdoc(options);
};