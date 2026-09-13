const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const app = require('../server');

function request(path) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      http.get(`http://localhost:${port}${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        });
      }).on('error', (err) => {
        server.close();
        reject(err);
      });
    });
  });
}

test('GET /health returns 200 and status ok', async () => {
  const res = await request('/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'ok');
});

test('GET /api/users returns a list of users', async () => {
  const res = await request('/api/users');
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});
