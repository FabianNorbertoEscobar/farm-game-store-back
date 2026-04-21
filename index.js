const BASE_URL = 'https://fakestoreapi.com';

const [, , method, resource, ...rest] = process.argv;

const run = async () => {
  if (!method || !resource) {
    console.log('Uso: npm run start <GET|POST|DELETE> <resource>');
    console.log('Ejemplos:');
    console.log('  npm run start GET products');
    console.log('  npm run start GET products/5');
    console.log('  npm run start POST products "T-Shirt-Rex" 300 remeras');
    console.log('  npm run start DELETE products/7');
    return;
  }

  const [resourceName, resourceId] = resource.split('/');

  if (method.toUpperCase() === 'GET') {
    if (resourceId) {
      const res = await fetch(`${BASE_URL}/${resourceName}/${resourceId}`);
      const product = await res.json();
      const { id, title, price, category, description } = product;
      console.log({ id, title, price, category, description });
    } else {
      const res = await fetch(`${BASE_URL}/${resourceName}`);
      const products = await res.json();
      const resumen = products.map(({ id, title, price, category }) => ({ id, title, price, category }));
      console.table(resumen);
    }
  } else if (method.toUpperCase() === 'POST') {
    const [title, price, category] = rest;

    if (!title || !price || !category) {
      console.log('Faltan datos para crear el producto.');
      console.log('Uso: npm run start POST products <title> <price> <category>');
      return;
    }

    const body = {
      title,
      price: parseFloat(price),
      category,
      description: `Producto de la categoría ${category}`,
      image: 'https://fakestoreapi.com/img/placeholder.png',
    };

    const res = await fetch(`${BASE_URL}/${resourceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const newProduct = await res.json();
    console.log(`✅ Producto creado exitosamente con ID: ${newProduct.id}`);
    console.log(newProduct);
  } else if (method.toUpperCase() === 'DELETE') {
    if (!resourceId) {
      console.log('Debés indicar el ID del producto a eliminar.');
      console.log('Uso: npm run start DELETE products/<productId>');
      return;
    }

    const res = await fetch(`${BASE_URL}/${resourceName}/${resourceId}`, {
      method: 'DELETE',
    });

    const deleted = await res.json();
    console.log(`🗑️  Producto eliminado:`);
    const { id, title, price, category } = deleted;
    console.log({ id, title, price, category });
  } else {
    console.log(`❌ Método no soportado: ${method}`);
    console.log('Métodos disponibles: GET, POST, DELETE');
  }
};

run().catch((err) => {
  console.error('Error al ejecutar el comando:', err.message);
  process.exit(1);
});
