import { env } from "../config/env.js";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Farm Game Store API",
    version: "1.0.0",
    description:
      "API REST para autenticacion y administracion de productos de la tienda de un juego de granja. Usa Express, JWT y Firestore.",
  },
  tags: [
    {
      name: "Health",
      description: "Verificacion rapida del estado de la API",
    },
    {
      name: "Auth",
      description: "Autenticacion y emision de Bearer token",
    },
    {
      name: "Products",
      description: "CRUD de productos protegido con JWT",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          ok: {
            type: "boolean",
            example: true,
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Error interno del servidor",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@farmgamestore.com",
          },
          password: {
            type: "string",
            example: "123456",
          },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          type: {
            type: "string",
            example: "Bearer",
          },
          token: {
            type: "string",
            example: "<JWT>",
          },
        },
      },
      Product: {
        type: "object",
        required: ["id", "title", "category", "img", "price"],
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          title: {
            type: "string",
            example: "Peluches de animales",
          },
          category: {
            type: "string",
            example: "decoracion",
          },
          img: {
            type: "string",
            example: "/imgs/peluches_de_animales.jpeg",
          },
          price: {
            type: "integer",
            description: "Precio expresado en coins",
            example: 9560,
          },
        },
      },
      ProductCreateRequest: {
        type: "object",
        required: ["title", "category", "price"],
        properties: {
          id: {
            type: "integer",
            example: 32,
            description:
              "Opcional. Si no se envia, la API calcula el siguiente id disponible.",
          },
          title: {
            type: "string",
            example: "Semillas Premium",
          },
          category: {
            type: "string",
            example: "decoracion",
          },
          img: {
            type: "string",
            example: "/imgs/semillas_premium.jpeg",
          },
          price: {
            type: "integer",
            example: 9500,
          },
        },
      },
      ProductPutRequest: {
        type: "object",
        required: ["title", "category", "price"],
        properties: {
          title: {
            type: "string",
            example: "Semillas Premium Deluxe",
          },
          category: {
            type: "string",
            example: "decoracion",
          },
          img: {
            type: "string",
            example: "/imgs/semillas_premium_deluxe.jpeg",
          },
          price: {
            type: "integer",
            example: 12000,
          },
        },
      },
      ProductPatchRequest: {
        type: "object",
        properties: {
          title: {
            type: "string",
            example: "Semillas Premium Deluxe",
          },
          category: {
            type: "string",
            example: "decoracion",
          },
          img: {
            type: "string",
            example: "/imgs/semillas_premium_deluxe.jpeg",
          },
          price: {
            type: "integer",
            example: 12000,
          },
        },
      },
      DeleteProductResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Producto eliminado",
          },
          product: {
            $ref: "#/components/schemas/Product",
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "La solicitud es invalida o faltan datos requeridos",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            examples: {
              required: {
                value: {
                  message: "title, price y category son obligatorios",
                },
              },
              invalidPrice: {
                value: {
                  message: "price debe ser un numero entero mayor o igual a 0",
                },
              },
            },
          },
        },
      },
      Unauthorized: {
        description:
          "No se envio token o el formato del Authorization header es invalido",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              message: "Token no provisto o invalido",
            },
          },
        },
      },
      Forbidden: {
        description: "El token JWT es invalido o expiro",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              message: "Token invalido o expirado",
            },
          },
        },
      },
      NotFound: {
        description: "El recurso solicitado no existe",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            examples: {
              product: {
                value: {
                  message: "Producto no encontrado",
                },
              },
              route: {
                value: {
                  message: "Ruta no encontrada",
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        description:
          "Error interno del servidor o error de integracion con Firestore",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            examples: {
              generic: {
                value: {
                  message: "Error interno del servidor",
                },
              },
              firestore: {
                value: {
                  message:
                    "Firestore rechazo la operacion. Verifica reglas de seguridad o credenciales de Firebase Auth.",
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Healthcheck de la API",
        responses: {
          200: {
            description: "La API esta disponible",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autenticar usuario y devolver Bearer token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Credenciales validas. Se devuelve un JWT.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },
          400: {
            description: "Faltan email o password",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  message: "email y password son obligatorios",
                },
              },
            },
          },
          401: {
            description: "Credenciales invalidas",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  message: "Credenciales invalidas",
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Listar todos los productos",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Listado de productos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/Unauthorized",
          },
          403: {
            $ref: "#/components/responses/Forbidden",
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
    },
    "/api/products/create": {
      post: {
        tags: ["Products"],
        summary: "Crear un producto",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductCreateRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Producto creado correctamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          400: {
            description: "Payload invalido o id duplicado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  required: {
                    value: {
                      message: "title, price y category son obligatorios",
                    },
                  },
                  invalidId: {
                    value: {
                      message: "id debe ser un numero entero positivo",
                    },
                  },
                  duplicateId: {
                    value: {
                      message: "Ya existe un producto con ese id",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/Unauthorized",
          },
          403: {
            $ref: "#/components/responses/Forbidden",
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Obtener un producto por id numerico",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Producto encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/Unauthorized",
          },
          403: {
            $ref: "#/components/responses/Forbidden",
          },
          404: {
            description: "No existe un producto con ese id",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  message: "Producto no encontrado",
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Reemplazar un producto por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductPutRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Producto actualizado correctamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          400: {
            description: "Payload invalido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  required: {
                    value: {
                      message: "title, price y category son obligatorios",
                    },
                  },
                  immutableId: {
                    value: {
                      message: "id no puede modificarse",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/Unauthorized",
          },
          403: {
            $ref: "#/components/responses/Forbidden",
          },
          404: {
            description: "No existe un producto con ese id",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  message: "Producto no encontrado",
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Actualizar parcialmente un producto por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductPatchRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Producto actualizado parcialmente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          400: {
            description:
              "No se enviaron campos validos o se intento modificar id",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  empty: {
                    value: {
                      message: "Debes enviar al menos un campo para actualizar",
                    },
                  },
                  immutableId: {
                    value: {
                      message: "id no puede modificarse",
                    },
                  },
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/Unauthorized",
          },
          403: {
            $ref: "#/components/responses/Forbidden",
          },
          404: {
            description: "No existe un producto con ese id",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  message: "Producto no encontrado",
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Eliminar un producto por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Producto eliminado correctamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteProductResponse",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/Unauthorized",
          },
          403: {
            $ref: "#/components/responses/Forbidden",
          },
          404: {
            description: "No existe un producto con ese id",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  message: "Producto no encontrado",
                },
              },
            },
          },
          500: {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
    },
  },
};
