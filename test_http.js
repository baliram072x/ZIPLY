const http = require('http');

const data = JSON.stringify({
  phone: '9876543210'
});

const req = http.request('http://localhost:5000/api/auth/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const otp = JSON.parse(body).otp || '1234'; // demo mode doesn't matter, wait verify-otp checks Map!
    // But verify-otp allows checking if we grab it from Map
    console.log('send-otp res:', body);
  });
});
req.write(data);
req.end();
