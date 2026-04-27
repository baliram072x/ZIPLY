const axios = require('axios');
const jwt = require('./server/node_modules/jsonwebtoken');

const token = jwt.sign({ id: 'u1', phone: '9876543210' }, 'ziply-super-secret-key');

async function testOrder() {
  try {
    const res = await axios.post('http://localhost:5000/api/orders', {
      items: [{id: 'p1', name: 'Item', price: 10, qty: 1}],
      total: 10,
      shop_id: 'sharma-kirana',
      shop_name: 'Sharma Kirana Store',
      delivery_address: 'Home'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Order success:', res.data);
  } catch(e) {
    console.error('Order fail:', e.response?.data || e.message);
  }
}

testOrder();
