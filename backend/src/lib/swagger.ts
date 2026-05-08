import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TontinePro API',
      version: '1.0.0',
      description: 'Documentation de l\'API de la plateforme TontinePro',
      contact: {
        name: 'Support TontinePro',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Chemins vers les fichiers contenant les annotations
};

export const swaggerSpec = swaggerJsdoc(options);
