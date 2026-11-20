const base = process.env.API_URL || 'http://localhost:3000/api';
const assert = require('assert');
async function request(path, method = 'GET', body) {
    const r = await fetch(base + path, {
      method,
      headers: body ? {
        'Content-Type': 'application/json'
      } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    let data = {};
    try {
      data = await r.json();
    } catch (_) {}
    return {
      status: r.status,
      data
    };
  }
  (async () => {
    const health = await request('/health');
    assert.equal(health.status, 200);
    console.log('PASS GET /api/health -> 200');
    let r = await request('/products');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
    console.log('PASS GET /api/products -> 200');
    r = await request('/products/999999');
    assert.equal(r.status, 404);
    console.log('PASS GET /api/products/:id missing -> 404');
    r = await request('/products', 'POST', {
      name: 'API Test Product',
      category: 'Testing',
      price: 25,
      qty: 20
    });
    assert.equal(r.status, 201);
    const product = r.data;
    console.log('PASS POST /api/products -> 201');
    r = await request(`/products/${product.id}`);
    assert.equal(r.status, 200);
    console.log('PASS GET /api/products/:id -> 200');
    r = await request(`/products/${product.id}`, 'PUT', {
      name: 'Updated API Test Product',
      category: 'Testing',
      price: 30,
      qty: 20
    });
    assert.equal(r.status, 200);
    assert.equal(r.data.name, 'Updated API Test Product');
    console.log('PASS PUT /api/products/:id -> 200');
    r = await request('/products', 'POST', {
      name: '',
      price: -1,
      qty: -1
    });
    assert.equal(r.status, 400);
    console.log('PASS POST /api/products invalid body -> 400');
    r = await request('/sales');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
    console.log('PASS GET /api/sales -> 200');
    r = await request('/sales/999999');
    assert.equal(r.status, 404);
    console.log('PASS GET /api/sales/:id missing -> 404');
    r = await request('/sales', 'POST', {
      productId: product.id,
      qty: 2,
      customer: 'API Test Customer'
    });
    assert.equal(r.status, 201);
    const sale = r.data;
    console.log('PASS POST /api/sales -> 201');
    r = await request(`/sales/${sale.id}`);
    assert.equal(r.status, 200);
    console.log('PASS GET /api/sales/:id -> 200');
    r = await request(`/sales/${sale.id}`, 'PUT', {
      productId: product.id,
      qty: 3,
      customer: 'Updated Test Customer'
    });
    assert.equal(r.status, 200);
    assert.equal(r.data.qty, 3);
    console.log('PASS PUT /api/sales/:id -> 200');
    r = await request(`/sales/${sale.id}`, 'DELETE');
    assert.equal(r.status, 200);
    console.log('PASS DELETE /api/sales/:id -> 200');
    r = await request(`/products/${product.id}`, 'DELETE');
    assert.equal(r.status, 200);
    console.log('PASS DELETE /api/products/:id -> 200');
    r = await request('/sales', 'POST', {
      productId: product.id,
      qty: 1
    });
    assert.equal(r.status, 404);
    console.log('PASS POST /api/sales unknown product -> 404');
    console.log('\nALL API SMOKE TESTS PASSED');
  })().catch(err => {
    console.error('API TEST FAILED:', err);
    process.exit(1);
  });