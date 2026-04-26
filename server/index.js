const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const db = new Database('database.db');
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ziply-super-secret-key';

app.use(cors());
app.use(express.json());

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    items TEXT,
    total REAL,
    status TEXT,
    shop_id TEXT,
    shop_name TEXT,
    delivery_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// In-memory OTP storage (for demo purposes)
const otps = new Map();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- AUTH ENDPOINTS ---

// 1. Send OTP (Simulated)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  // Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otps.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

  console.log(`[OTP] For ${phone}: ${otp}`); // Log to console for development
  
  res.json({ message: 'OTP sent successfully', otp }); // Sending OTP in response for demo convenience
});

// 2. Verify OTP & Check User
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const stored = otps.get(phone);

  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // OTP verified, remove it
  otps.delete(phone);

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  
  if (user) {
    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET);
    return res.json({ exists: true, user, token });
  }
  
  res.json({ exists: false, message: 'OTP verified, please complete profile' });
});

// 3. Register new user
app.post('/api/auth/register', (req, res) => {
  const { name, phone, address } = req.body;
  const id = 'USR' + Math.random().toString(36).slice(2, 7).toUpperCase();

  try {
    const stmt = db.prepare('INSERT INTO users (id, name, phone, address) VALUES (?, ?, ?, ?)');
    stmt.run(id, name, phone, address);
    
    const user = { id, name, phone, address };
    const token = jwt.sign({ id, phone }, JWT_SECRET);
    
    res.status(201).json({ user, token });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// 4. Get current user profile (session check)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// --- ORDER ENDPOINTS ---

// 1. Place an order
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total, shop_id, shop_name, delivery_address } = req.body;
  const user_id = req.user.id;
  const id = 'ORD' + Math.random().toString(36).slice(2, 8).toUpperCase();

  try {
    const stmt = db.prepare(`
      INSERT INTO orders (id, user_id, items, total, status, shop_id, shop_name, delivery_address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, user_id, JSON.stringify(items), total, 'Pending', shop_id, shop_name, delivery_address);
    
    const order = { id, user_id, items, total, status: 'Pending', shop_id, shop_name, delivery_address, created_at: new Date() };
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 2. Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user_id);
    // Parse items JSON string back to object
    const parsedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
    res.json(parsedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
