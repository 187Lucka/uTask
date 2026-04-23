"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Task API',
        version: '1.0.0',
        description: 'API documentation for the Task API (users, health, default)'
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Local server'
        }
    ],
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'kx12ab34cd' },
                    username: { type: 'string', example: 'alice' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    error: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/': {
            get: {
                summary: 'Welcome',
                responses: {
                    '200': {
                        description: 'Welcome message',
                        content: {
                            'application/json': {
                                schema: { type: 'object' }
                            }
                        }
                    }
                }
            }
        },
        '/api/health': {
            get: {
                summary: 'Health check',
                responses: {
                    '200': {
                        description: 'API health',
                        content: { 'application/json': { schema: { type: 'object' } } }
                    }
                }
            }
        },
        '/api/users/register': {
            post: {
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { username: { type: 'string' } },
                                required: ['username']
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'User created',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
                    },
                    '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/users/{id}': {
            get: {
                summary: 'Get user by id',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'User found', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                summary: 'Delete user by id',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Deleted', content: { 'application/json': { schema: { type: 'object' } } } },
                    '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        }
    }
};
exports.default = swaggerSpec;
