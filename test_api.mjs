

async function run() {
  const phone = `89${Math.floor(Math.random()*100000000)}`;
  console.log('Registering with phone:', phone);
  
  // 1. send otp
  await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  
  // 2. register
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jhon', phone, address: 'Test address', lat:0, lng:0 })
  });
  
  const regData = await regRes.json();
  console.log('Reg:', regData);
  
  // 3. place order
  const orderData = {
    items: [],
    total: 109,
    shop_id: "sharma-kirana",
    shop_name: "Sharma",
    delivery_address: "Pune"
  };
  
  const orderRes = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${regData.token}`
    },
    body: JSON.stringify(orderData)
  });
  
  const result = await orderRes.json();
  console.log('Order Result:', result);
}
run();
