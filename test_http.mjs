import http from 'http';
import jwt from './server/node_modules/jsonwebtoken/index.js';

const token = jwt.sign({ id: 'USR654SF', phone: '9876543210' }, 'ziply-super-secret-key');

const data = JSON.stringify({
  items: [{product: {id: 'p1', name: 'Item', price: 10, unit: 'pc', emoji: '📦', category: 'Grocery', popular: false}, qty: 1}],
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
