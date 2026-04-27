const http = require('http');
const jwt = require('./server/node_modules/jsonwebtoken');

const token = jwt.sign({ id: 'u1', phone: '9876543210' }, 'ziply-super-secret-key');

const data = JSON.stringify({
  items: [{id: 'p1', name: 'Item', price: 10, qty: 1}],
  total: 10,
  shop_id: 'sharma-kirana',
  shop_name: 'Sharma Kirana Store',
  delivery_address: 'Home'
});

const req = http.request('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer ' + token
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('ORDER RES:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();
