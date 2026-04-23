interface SwaggerSchema {
  type: string;
  properties?: Record<string, any>;
  example?: any;
  required?: string[];
  items?: any;
  $ref?: string;
}

interface SwaggerParameter {
  name: string;
  in: string;
  required: boolean;
  description?: string;
  schema: {
    type: string;
    example?: string;
  };
}

interface SwaggerPath {
  [method: string]: {
    tags?: string[];
    summary: string;
    description?: string;
    parameters?: SwaggerParameter[];
    requestBody?: {
      required: boolean;
      content: {
        'application/json': {
          schema: SwaggerSchema;
          example?: any;
        };
      };
    };
    responses: Record<string, {
      description: string;
      content?: {
        'application/json': {
          schema: any;
          example?: any;
        };
      };
    }>;
  };
}

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags?: Array<{
    name: string;
    description: string;
  }>;
  components: {
    schemas: Record<string, SwaggerSchema>;
    securitySchemes?: Record<string, any>;
  };
  paths: Record<string, SwaggerPath>;
}

const swaggerSpec: SwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Task API',
    version: '1.0.0',
    description: 'API documentation for the Task API'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Local server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '60d5ecb54ab1234567890123' },
          username: { type: 'string', example: 'john_doe' }
        }
      },
      CreateUserRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'john_doe' }
        },
        required: ['username']
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                field: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' }
  ],
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Welcome endpoint',
        description: 'Returns a welcome message to verify the API is running',
        responses: {
          '200': {
            description: 'Welcome message',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Welcome to Task API' }
                  }
                },
                example: {
                  success: true,
                  message: 'Welcome to Task API'
                }
              }
            }
          }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the API',
        responses: {
          '200': {
            description: 'API is healthy and running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task API is running' }
                  }
                },
                example: {
                  success: true,
                  message: 'Task API is running'
                }
              }
            }
          }
        }
      }
    },
    '/api/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register a new user',
        description: 'Creates a new user with the provided username',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'john_doe' }
                },
                required: ['username']
              },
              example: {
                username: 'john_doe'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                    message: { type: 'string', example: 'User registered successfully' }
                  }
                },
                example: {
                  success: true,
                  data: {
                    id: '60d5ecb54ab1234567890123',
                    username: 'john_doe'
                  },
                  message: 'User registered successfully'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input or validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Username is required'
                }
              }
            }
          },
          '409': {
            description: 'Username already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Username already exists'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  errors: [
                    {
                      message: 'string',
                      field: 'string'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieves a user by their unique identifier',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Unique identifier of the user',
            schema: { type: 'string', example: '60d5ecb54ab1234567890123' }
          }
        ],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' }
                  }
                },
                example: {
                  success: true,
                  data: {
                    id: '60d5ecb54ab1234567890123',
                    username: 'john_doe'
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid user ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Invalid user ID format'
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'User not found'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  errors: [
                    {
                      message: 'string',
                      field: 'string'
                    }
                  ]
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user by ID',
        description: 'Deletes a user and all associated boards, lists, and cards',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Unique identifier of the user to delete',
            schema: { type: 'string', example: '60d5ecb54ab1234567890123' }
          }
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User deleted successfully' }
                  }
                },
                example: {
                  success: true,
                  message: 'User deleted successfully'
                }
              }
            }
          },
          '400': {
            description: 'Invalid user ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Invalid user ID format'
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'User not found'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  errors: [
                    {
                      message: 'string',
                      field: 'string'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerSpec;
