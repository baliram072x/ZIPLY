const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const twilio = require('twilio');

const app = express();
const db = new Database('database.db');
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ziply-super-secret-key';

// Twilio Config
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && 
    process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('[Twilio] Initialized successfully');
  } catch (err) {
    console.error('[Twilio] Failed to initialize:', err.message);
  }
} else {
  console.log('[Twilio] Using Demo Mode (No valid credentials)');
}

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    address TEXT,
    lat REAL,
    lng REAL,
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
    delivery_boy_name TEXT,
    delivery_boy_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT,
    emoji TEXT,
    color TEXT,
    tagline TEXT,
    rating REAL,
    distanceKm REAL,
    lat REAL,
    lng REAL,
    products TEXT -- JSON string
  );
`);

// Seed shops if empty
const countShops = db.prepare("SELECT count(*) as count FROM shops").get();
if (countShops.count === 0) {
  console.log('[DB] Seeding initial shops...');
  const initialShops = [
    {
      id: "sharma-kirana",
      name: "Sharma Kirana Store",
      emoji: "🏪",
      color: "from-amber-500 to-orange-600",
      tagline: "Sabse sasta, sabse achha",
      rating: 4.8,
      distanceKm: 0.8,
      lat: 12.9358,
      lng: 77.6232,
      products: JSON.stringify([
        { id: "p1", name: "Aashirvaad Atta", price: 545, unit: "10kg", emoji: "🌾", category: "Atta, Rice & Dal" },
        { id: "p2", name: "Amul Gold Milk", price: 33, unit: "500ml", emoji: "🥛", category: "Dairy & Bread" },
        { id: "p3", name: "Maggi Noodles", price: 14, unit: "70g", emoji: "🍜", category: "Snacks & Munchies" },
      ])
    },
    {
      id: "apollo-pharmacy",
      name: "Apollo Pharmacy",
      emoji: "💊",
      color: "from-blue-500 to-cyan-600",
      tagline: "24/7 Healthcare support",
      rating: 4.9,
      distanceKm: 1.2,
      lat: 12.9338,
      lng: 77.6212,
      products: JSON.stringify([
        { id: "p4", name: "Dolo 650", price: 30, unit: "15 tabs", emoji: "🤒", category: "Medicines" },
        { id: "p5", name: "Hand Sanitizer", price: 50, unit: "100ml", emoji: "🧼", category: "Personal Care" },
      ])
    }
  ];

  const insert = db.prepare("INSERT INTO shops (id, name, emoji, color, tagline, rating, distanceKm, lat, lng, products) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  initialShops.forEach(s => {
    insert.run(s.id, s.name, s.emoji, s.color, s.tagline, s.rating, s.distanceKm, s.lat, s.lng, s.products);
  });
}

// Seed users if empty
const countUsers = db.prepare("SELECT count(*) as count FROM users").get();
if (countUsers.count === 0) {
  console.log('[DB] Seeding initial users...');
  const initialUsers = [
    {
      id: "u1",
      phone: "9876543210",
      name: "Rahul Sharma",
      address: "Koramangala Block 5, Bengaluru",
      lat: 12.9348,
      lng: 77.6222
    },
    {
      id: "u2",
      phone: "9123456789",
      name: "Priya Singh",
      address: "HSR Layout Sector 2, Bengaluru",
      lat: 12.9081,
      lng: 77.6476
    }
  ];

  const insertUser = db.prepare("INSERT INTO users (id, phone, name, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?)");
  initialUsers.forEach(u => {
    insertUser.run(u.id, u.phone, u.name, u.address, u.lat, u.lng);
  });
}

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

// 1. Send OTP (Simulated or Real)
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  // Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otps.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

  console.log(`[OTP] For ${phone}: ${otp}`); 
  
  let sentReal = false;
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: `Your Ziply verification code is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`
      });
      sentReal = true;
      console.log(`[Twilio] SMS sent to ${phone}`);
    } catch (err) {
      console.error('[Twilio Error]', err.message);
    }
  }
  
  res.json({ 
    message: sentReal ? 'OTP sent to your phone' : 'OTP sent successfully (Demo mode)', 
    otp: sentReal ? undefined : otp, // Don't return OTP if sent via real SMS
    demo: !sentReal
  });
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
  const { name, phone, address, lat, lng } = req.body;
  const id = 'USR' + Math.random().toString(36).slice(2, 7).toUpperCase();

  try {
    const stmt = db.prepare('INSERT INTO users (id, name, phone, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, name, phone, address, lat, lng);
    
    const user = { id, name, phone, address, lat, lng };
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
  
  console.log('[DEBUG PLACE ORDER] user_id:', user_id, 'shop_id:', shop_id);
  
  const id = 'ORD' + Math.random().toString(36).slice(2, 8).toUpperCase();

  try {
    // Resiliency: ensure the shop and user exist in the DB to avoid FOREIGN KEY errors from stale localStorage caches
    try {
      db.prepare('INSERT OR IGNORE INTO shops (id, name, emoji, color, tagline, rating, distanceKm, lat, lng, products) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(shop_id, shop_name || 'Shop', '🛒', 'from-gray-500 to-gray-400', 'Local shop', 4.5, 1.0, 0, 0, '[]');
      db.prepare('INSERT OR IGNORE INTO users (id, phone, name, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?)').run(user_id, '9999999999', req.user.name || 'User', delivery_address, 0, 0);
    } catch (ignore) {}

    const stmt = db.prepare(`
      INSERT INTO orders (id, user_id, items, total, status, shop_id, shop_name, delivery_address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    stmt.run(id, user_id, JSON.stringify(items), total, 'Pending', shop_id, shop_name, delivery_address);
    
    const order = { 
      id, 
      user_id, 
      items, 
      total, 
      status: 'Pending', 
      shop_id, 
      shop_name, 
      delivery_address, 
      created_at: now 
    };
    res.status(201).json(order);
  } catch (error) {
    console.error('PLACE ORDER ERROR:', error.message, error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 2. Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  console.log(`Fetching orders for user: ${user_id}`);
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user_id);
    console.log(`Found ${orders.length} orders`);
    // Parse items JSON string back to object
    const parsedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
    res.json(parsedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// 3. Get vendor orders (NEW)
app.get('/api/vendor/orders', (req, res) => {
  const { shop_id } = req.query;
  if (!shop_id) return res.status(400).json({ error: 'shop_id required' });

  try {
    // Join with users to get customer details
    const orders = db.prepare(`
      SELECT o.*, u.name as customer_name, u.phone as customer_phone 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE o.shop_id = ? 
      ORDER BY o.created_at DESC
    `).all(shop_id);

    const parsedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
    res.json(parsedOrders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch vendor orders' });
  }
});

// --- SHOP ENDPOINTS ---

// 1. Get all shops
app.get('/api/shops', (req, res) => {
  try {
    const shops = db.prepare('SELECT * FROM shops').all();
    const parsedShops = shops.map(s => ({
      ...s,
      products: JSON.parse(s.products || '[]')
    }));
    res.json(parsedShops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// 2. Update shop products (Bulk)
app.post('/api/shops/:id/products', (req, res) => {
  const { id } = req.params;
  const { products } = req.body;

  try {
    const stmt = db.prepare('UPDATE shops SET products = ? WHERE id = ?');
    const result = stmt.run(JSON.stringify(products), id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ message: 'Products updated successfully', shopId: id });
  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

// 4. Update order status (NEW)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, delivery_boy_name, delivery_boy_phone } = req.body;

  try {
    let result;
    if (delivery_boy_name) {
      const stmt = db.prepare('UPDATE orders SET status = ?, delivery_boy_name = ?, delivery_boy_phone = ? WHERE id = ?');
      result = stmt.run(status, delivery_boy_name, delivery_boy_phone, id);
    } else {
      const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
      result = stmt.run(status, id);
    }

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ 
      message: 'Status updated successfully', 
      id, 
      status, 
      delivery_boy_name, 
      delivery_boy_phone 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// --- ADMIN ENDPOINTS (NEW) ---

app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.*, 
        COUNT(o.id) as orders_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/analytics', (req, res) => {
  try {
    const revenueRow = db.prepare(`SELECT SUM(total) as revenue FROM orders WHERE status = 'Delivered' OR status = 'Placed' OR status = 'Out for Delivery' OR status = 'Preparing'`).get();
    const ordersRow = db.prepare(`SELECT COUNT(*) as count FROM orders`).get();
    const usersRow = db.prepare(`SELECT COUNT(*) as count FROM users`).get();

    res.json({
      totalRevenue: revenueRow.revenue || 0,
      totalOrders: ordersRow.count || 0,
      activeUsers: usersRow.count || 0,
      avgDeliveryTime: "14 min" // Computed statically for now since no timestamps exist for deltas
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// 5. Get available delivery orders (NEW)
app.get('/api/delivery/orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as customer_name, u.phone as customer_phone, u.lat as customer_lat, u.lng as customer_lng
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `).all();

    const parsedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
    res.json(parsedOrders);
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
