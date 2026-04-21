# 🛒 FakeStore CLI - Gestor de Productos

**Herramienta de línea de comandos desarrollada en Node.js para interactuar con la API FakeStore y gestionar productos.**

---

## 📋 Descripción del Proyecto

Este proyecto es un trabajo práctico del curso **NodeJS/ExpressJS** de TalentoTech que implementa un cliente CLI (Command Line Interface) para consumir la API pública de **FakeStore**.

La aplicación permite realizar operaciones CRUD (Create, Read, Delete) sobre productos mediante comandos simples desde la terminal, interpretando parámetros y formateando respuestas de manera legible.

---

## 🚀 Instalación

1. Asegúrate de tener `"type": "module"` en `package.json` (ya está incluido).

2. Para ejecutar los comandos, utiliza:

   ```bash
   npm run start <MÉTODO> <RECURSO> [PARÁMETROS]
   ```

---

## 📖 Uso

### Comando Base

```bash
npm run start <MÉTODO> <RECURSO> [PARÁMETROS]
```

### Operaciones Disponibles

#### 1. **GET - Listar Todos los Productos**

```bash
npm run start GET products
```

Devuelve una tabla con los 20 productos disponibles mostrando: ID, título, precio y categoría.

#### 2. **GET - Consultar Producto por ID**

```bash
npm run start GET products/<productId>
```

**Ejemplo:**

```bash
npm run start GET products/15
```

Devuelve el detalle completo del producto (ID, título, precio, categoría, descripción).

#### 3. **POST - Crear Nuevo Producto**

```bash
npm run start POST products <title> <price> <category>
```

**Ejemplo:**

```bash
npm run start POST products T-Shirt-Rex 300 remeras
```

Crea un nuevo producto y devuelve la respuesta con el ID asignado.

#### 4. **DELETE - Eliminar Producto**

```bash
npm run start DELETE products/<productId>
```

**Ejemplo:**

```bash
npm run start DELETE products/7
```

Elimina el producto especificado y muestra sus datos previos.

---

## 🛠️ Estructura Técnica

```
.
├── package.json          # Configuración del proyecto
├── index.js              # Implementación principal
└── README.md             # Este archivo
```

### Conceptos Implementados

| Concepto            | Aplicación                                             |
| ------------------- | ------------------------------------------------------ |
| **ESModules**       | Habilitado con `"type": "module"` en package.json      |
| **Async/Await**     | Función `run()` asíncrona para operaciones HTTP        |
| **Fetch API**       | Consumo de endpoints HTTP (GET, POST, DELETE)          |
| **process.argv**    | Parseado de comandos: `[,, method, resource, ...rest]` |
| **Destructuring**   | Extracción de campos: `{ id, title, price, category }` |
| **Spread Operator** | Captura de parámetros adicionales: `...rest`           |
| **Array Methods**   | `.map()`, `.split()` para transformación de datos      |
| **console.table**   | Presentación visual de listas                          |

---

## 📍 API Utilizada

**FakeStore API** - Base URL: `https://fakestoreapi.com`

Documentación: https://fakestoreapi.com/docs

Operaciones soportadas:

- `GET /products` - Obtener todos los productos
- `GET /products/:id` - Obtener producto específico
- `POST /products` - Crear nuevo producto
- `DELETE /products/:id` - Eliminar producto

---

## ✅ Validación

Para verificar que todo funciona:

```bash
# Listar todos los productos
npm run start GET products

# Obtener producto específico
npm run start GET products/5

# Crear producto
npm run start POST products "Nuevo Producto" 99.99 electronics

# Eliminar producto
npm run start DELETE products/10
```

---

## 📝 Notas de Desarrollo

- **Manejo de errores:** Implementado con try/catch en la función `run()`
- **Validación:** Se verifica presencia de parámetros requeridos antes de hacer requests
- **API Mock:** FakeStore simula las respuestas; los productos creados se retornan pero no persisten
- **Encoding:** Se envía `'Content-Type': 'application/json'` en requests POST

---

## 👤 Autor

Fabián Norberto Escobar
