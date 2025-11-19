import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UAIFood API',
      version: '1.0.0',
      description: 'Documentação da API do sistema de delivery UAIFood',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Autenticação'],
          summary: 'Registra um novo usuário (Cliente)',
          description: 'Cria uma nova conta de usuário com perfil de CLIENTE.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'phone', 'password'],
                  properties: {
                    name: { type: 'string', example: 'João da Silva' },
                    phone: { type: 'string', description: 'Telefone com DDD', example: '34999998888' },
                    password: { type: 'string', format: 'password', minLength: 6, example: 'senha123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Usuário criado com sucesso.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      phone: { type: 'string' },
                      userType: { type: 'string', example: 'CLIENT' },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
            400: { description: 'Dados inválidos enviados.' },
            409: { description: 'Telefone já cadastrado.' },
            500: { description: 'Erro interno do servidor.' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Autenticação'],
          summary: 'Autentica um usuário e retorna um token JWT',
          description: 'Recebe telefone e senha para realizar o login.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    phone: { type: 'string', example: '34999998888' },
                    password: { type: 'string', format: 'password', example: '123456' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login bem-sucedido.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          phone: { type: 'string' },
                          userType: { type: 'string', enum: ['CLIENT', 'ADMIN'] },
                        },
                      },
                      token: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: { description: 'Não autorizado (senha inválida).' },
            404: { description: 'Usuário não encontrado.' },
          },
        },
      },
      '/api/addresses': {
        get: {
          tags: ['Endereços'],
          summary: 'Lista os endereços do usuário',
          description: 'Requer autenticação Bearer Token.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { 
                description: 'Lista de endereços retornada com sucesso.',
                content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            street: { type: 'string', example: 'Av. Brasil' },
                            number: { type: 'string', example: '123' },
                            city: { type: 'string', example: 'Uberaba' },
                          }
                        },
                      },
                    },
                  },
            },
            401: { description: 'Não autenticado.' },
          },
        },
        post: {
          tags: ['Endereços'],
          summary: 'Cadastra um novo endereço',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['street', 'number', 'district', 'city', 'state', 'zipCode'],
                  properties: {
                    street: { type: 'string', example: 'Av. Brasil' },
                    number: { type: 'string', example: '100' },
                    district: { type: 'string', example: 'Centro' },
                    city: { type: 'string', example: 'São Paulo' },
                    state: { type: 'string', maxLength: 2, example: 'SP' },
                    zipCode: { type: 'string', example: '01000000' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Endereço criado.' },
            400: { description: 'Dados inválidos.' },
          },
        },
      },
      '/api/categories': {
        get: {
          tags: ['Cardápio'],
          summary: 'Lista todas as categorias',
          description: 'Retorna todas as categorias cadastradas em ordem alfabética.',
          responses: {
            200: {
              description: 'Sucesso.',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        description: { type: 'string', example: 'Pizzas' },
                      },
                    },
                  },
                },
              },
            },
            500: { description: 'Erro interno do servidor.' },
          },
        },
      },
      '/api/items': {
        get: {
          tags: ['Cardápio'],
          summary: 'Lista todos os itens do cardápio',
          description: 'Retorna todos os itens cadastrados.',
          responses: {
            200: {
              description: 'Sucesso.',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        description: { type: 'string', example: 'Pizza Calabresa' },
                        unitPrice: { type: 'number', format: 'float', example: 45.50 },
                        categoryId: { type: 'string' },
                        category: {
                          type: 'object',
                          properties: {
                            description: { type: 'string', example: 'Pizzas' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            500: { description: 'Erro interno do servidor.' },
          },
        },
      },
      '/api/orders': {
        post: {
          tags: ['Pedidos (Cliente)'],
          summary: 'Cria um novo pedido',
          description: 'Requer autenticação Bearer Token.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['paymentMethod', 'items'],
                  properties: {
                    paymentMethod: { type: 'string', enum: ['CASH', 'DEBIT', 'CREDIT', 'PIX'], example: 'PIX' },
                    items: {
                      type: 'array',
                      minItems: 1,
                      items: {
                        type: 'object',
                        required: ['itemId', 'quantity'],
                        properties: {
                          itemId: { type: 'string' },
                          quantity: { type: 'integer', minimum: 1, example: 2 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Pedido criado com sucesso.' },
            400: { description: 'Dados inválidos.' },
            401: { description: 'Não autenticado.' },
            500: { description: 'Erro interno.' },
          },
        },
        get: {
          tags: ['Pedidos (Cliente)'],
          summary: 'Lista os pedidos do usuário',
          description: 'Requer autenticação Bearer Token.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Sucesso.',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        status: { type: 'string', example: 'PENDING' },
                        paymentMethod: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        items: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              quantity: { type: 'integer' },
                              item: {
                                type: 'object',
                                properties: {
                                  description: { type: 'string' },
                                  unitPrice: { type: 'number' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Não autenticado.' },
            500: { description: 'Erro interno.' },
          },
        },
      },
    },
  },
  // Deixamos a lista de APIs vazia para ele não tentar ler os comentários antigos e dar erro
  apis: [], 
};

export const getSwaggerSpec = () => {
  return swaggerJsdoc(options);
};