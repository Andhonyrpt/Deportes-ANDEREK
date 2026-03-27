import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Deportes ANDEREK E-commerce API',
            version: '1.0.0',
            description: 'API documentation for Deportes ANDEREK backend services. Provides authentication, product management, cart management, and order processing capabilities.',
        },
        servers: [
            {
                url: 'http://localhost:{port}/api',
                description: 'Local development server',
                variables: {
                    port: {
                        default: '3000'
                    }
                }
            },
            {
                url: 'https://tu-dominio-produccion.com/api',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Introduzca el token JWT en formato: Bearer <token>'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
