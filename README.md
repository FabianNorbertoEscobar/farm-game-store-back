# Farm Game Store Back

Backend API REST para autenticacion y administracion de productos de una tienda de juego de granja. El proyecto usa Express Generator como base de arranque, Express Router para las rutas, JWT para seguridad y Firestore para persistencia.

## Caracteristicas

- Login con JWT Bearer.
- CRUD completo de productos.
- Arquitectura por capas: rutas, controladores, servicios, modelos, middlewares y configuracion.
- Firestore configurado con una coleccion de pruebas separada: `products-test`.
- Swagger UI integrado para explorar y probar la API.
- Manejo de errores HTTP para 400, 401, 403, 404 y 500.

## Stack

- Node.js
- Express
- Express Generator
- Firebase Firestore
- JSON Web Token
- Swagger UI Express

## Estructura principal

- [app.js](app.js): aplicacion Express principal.
- [bin/www](bin/www): arranque del servidor con Express Generator.
- [src/config](src/config): variables de entorno y Firebase.
- [src/routes](src/routes): definicion de endpoints.
- [src/controllers](src/controllers): controladores HTTP.
- [src/services](src/services): reglas de negocio y validaciones.
- [src/models](src/models): acceso a Firestore.
- [src/middlewares](src/middlewares): autenticacion y manejo de errores.
- [src/docs/swagger.js](src/docs/swagger.js): especificacion OpenAPI.

## Instalacion

```bash
npm install
```

## Variables de entorno

Usa [.env.example](.env.example) como base para crear tu `.env`.

Variables disponibles:

- `PORT`: puerto del servidor.
- `JWT_SECRET`: secreto usado para firmar tokens JWT.
- `AUTH_USER_EMAIL`: email valido para login.
- `AUTH_USER_PASSWORD`: password valida para login.
- `FIREBASE_AUTH_EMAIL`: email para autenticacion Firebase Auth si aplica.
- `FIREBASE_AUTH_PASSWORD`: password para autenticacion Firebase Auth si aplica.
- `FIREBASE_API_KEY`: API key del proyecto Firebase.
- `FIREBASE_AUTH_DOMAIN`: dominio auth de Firebase.
- `FIREBASE_PROJECT_ID`: id del proyecto Firebase.
- `FIREBASE_STORAGE_BUCKET`: bucket de storage.
- `FIREBASE_MESSAGING_SENDER_ID`: sender id.
- `FIREBASE_APP_ID`: app id web.
- `FIREBASE_PRODUCTS_COLLECTION`: coleccion usada por la API. Valor recomendado: `products-test`.
- `LOG_LEVEL`: nivel minimo a imprimir (`debug`, `info`, `warn`, `error`). Default: `info`.
- `LOG_FORMAT`: formato de salida (`pretty` o `json`). Si no se define: `pretty` en desarrollo y `json` en produccion.
- `LOG_COLOR`: en formato `pretty`, usar `0` para desactivar color ANSI en consola.

### Reglas importantes para produccion

- En `NODE_ENV=production` la app exige estas variables sin fallback: `JWT_SECRET`, `AUTH_USER_EMAIL`, `AUTH_USER_PASSWORD`.
- Si falta alguna de esas variables, la app falla al iniciar con un error explicito.

## Ejecucion

```bash
npm start
```

Servidor local:

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs.json

La ejecucion local sigue usando `node ./bin/www`.

## Produccion

- Base URL (Vercel): [https://farm-game-store-back.vercel.app](https://farm-game-store-back.vercel.app)
- Swagger UI: [https://farm-game-store-back.vercel.app/api-docs](https://farm-game-store-back.vercel.app/api-docs)
- OpenAPI JSON: [https://farm-game-store-back.vercel.app/api-docs.json](https://farm-game-store-back.vercel.app/api-docs.json)

## Autenticacion

Primero obtene un token con `POST /auth/login`.

Ejemplo de respuesta:

```json
{
  "type": "Bearer",
  "token": "<JWT>"
}
```

Despues envia el header:

```http
Authorization: Bearer <JWT>
```

## Modelo de producto

La API trabaja con este formato:

```json
{
  "id": 1,
  "category": "decoracion",
  "img": "/imgs/peluches_de_animales.jpeg",
  "price": 9560,
  "title": "Peluches de animales"
}
```

`price` representa el valor en coins del juego.

## Endpoints

### Health

- `GET /health`: verifica que la API este funcionando.

### Auth

- `POST /auth/login`: autentica usuario y devuelve Bearer token.

### Products

Todos requieren token JWT valido.

- `GET /api/products`: lista todos los productos.
- `GET /api/products/:id`: obtiene un producto por id numerico.
- `POST /api/products/create`: crea un producto.
- `PUT /api/products/:id`: reemplaza un producto existente.
- `PATCH /api/products/:id`: actualiza parcialmente un producto.
- `DELETE /api/products/:id`: elimina un producto.

Semantica:

- `PUT` exige `title`, `category` y `price` (reemplazo completo).
- `PATCH` permite enviar solo los campos a modificar (actualizacion parcial).

## Respuestas esperadas

- `200`: operacion exitosa de lectura, actualizacion o eliminacion.
- `201`: producto creado correctamente.
- `400`: datos faltantes o invalidos.
- `401`: falta token o formato invalido.
- `403`: token invalido o expirado.
- `404`: producto o ruta no encontrada.
- `500`: error interno o error de integracion con Firestore.

## Swagger

Swagger UI queda expuesto en:

- http://localhost:3000/api-docs

El JSON OpenAPI queda expuesto en:

- http://localhost:3000/api-docs.json

Swagger documenta:

- request bodies
- esquema Product
- autenticacion Bearer
- respuestas 200, 201, 400, 401, 403, 404 y 500 por endpoint
- ejemplos de errores comunes

## Logs y observabilidad

La API incluye logging estructurado con:

- timestamp ISO
- nivel (`INFO`, `WARN`, `ERROR`, `DEBUG`)
- request id por solicitud HTTP
- metodo, ruta, status, bytes y latencia
- usuario autenticado (`user=<email>`) o `anonymous`

### Formatos disponibles

- `pretty`: legible para desarrollo (con color por nivel).
- `json`: recomendado para produccion e integracion con plataformas de observabilidad.

### Ejemplos en formato pretty

```text
2026-06-02T03:17:55.619Z [INFO] Middlewares inicializados {"swaggerDocsPath":"/api-docs","apiDocsJsonPath":"/api-docs.json"}
2026-06-02T03:17:55.629Z [INFO] Servidor HTTP iniciado {"bind":"port 3000","port":3000,"baseUrl":"http://localhost:3000","nodeEnv":"development","pid":11428}
2026-06-02T03:18:10.696Z [INFO] [6736837d-3775-4c49-b477-24b264ba480e] GET /health 200 11 - 21.572 ms user=anonymous
2026-06-02T03:19:33.376Z [INFO] [35983525-f77c-4787-8452-7bc0aa6c833c] POST /api/products/create 201 119 - 1952.211 ms user=<email>
2026-06-02T03:20:33.045Z [INFO] [626b8c19-9e4e-4b4d-b18b-458d55c81bff] GET /api/products/33 404 36 - 587.376 ms user=<email>
```

### Ejemplo en formato json

```json
{
  "timestamp": "2026-06-02T03:17:55.629Z",
  "level": "info",
  "message": "Servidor HTTP iniciado",
  "meta": {
    "bind": "port 3000",
    "port": 3000,
    "baseUrl": "http://localhost:3000",
    "nodeEnv": "production",
    "pid": 11428
  }
}
```

## Notas de Firestore

- La coleccion configurada para pruebas es `products-test`.
- La coleccion real `products` puede mantenerse separada para no contaminar datos de produccion.

## Pruebas manuales

Podes probar la API desde Swagger UI en `/api-docs` o usando la coleccion de Postman incluida en [postman/farm-game-store-back.public.postman_collection.json](postman/farm-game-store-back.public.postman_collection.json).

## Coleccion de Postman

Se incluye una coleccion lista para ejecutar pruebas funcionales de punta a punta:

- Coleccion incluida: [postman/farm-game-store-back.public.postman_collection.json](postman/farm-game-store-back.public.postman_collection.json).
- Cubre healthcheck, login, CRUD de productos y casos de error (401, 403, 404).
- Incluye tests automaticos para validar status code y estructura basica de respuestas.
- Guarda `token` y `productId` en variables de coleccion para encadenar requests durante el run.

### Variables principales

- `baseUrlMode`: selector de entorno (`local` o `prod`).
- `baseUrlLocal`: URL local (default: `http://localhost:3000`).
- `baseUrlProd`: URL deployada en produccion (default: `https://farm-game-store-back.vercel.app`).
- `baseUrl`: variable activa usada por los requests (se setea automaticamente en pre-request segun `baseUrlMode`).
- `authEmail` y `authPassword`: credenciales para `POST /auth/login` (en la coleccion publica vienen como placeholders).
- `token`: JWT guardado despues del login exitoso.
- `productId`: id de producto guardado luego del create para usar en GET/PUT/PATCH/DELETE por id.

### Requests incluidos

- `GET /health`
- `POST /auth/login` (ok y credenciales invalidas)
- `GET /api/products`
- `POST /api/products/create`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- Casos de error: sin token, token invalido y ruta inexistente

### Modo de uso (Runner)

1. Importar la coleccion desde [postman/farm-game-store-back.public.postman_collection.json](postman/farm-game-store-back.public.postman_collection.json).
2. Completar `authEmail` y `authPassword` con credenciales validas.
3. Elegir entorno con `baseUrlMode`:
4. `local` para `baseUrlLocal`.
5. `prod` para `baseUrlProd`.
6. Ejecutar `Run collection` con 1 iteracion.
7. Revisar el resumen de tests pasados/fallados en el Runner.
