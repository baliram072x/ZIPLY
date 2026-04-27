import Database from './server/node_modules/better-sqlite3/lib/database.js';
const db = new Database('./database.db');
try {
  const stmt = db.prepare(`
        INSERT INTO orders (id, user_id, items, total, status, shop_id, shop_name, delivery_address) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
  stmt.run('ORD_TEST2', 'u1', '[]', 10, 'Pending', 'shop1', 'Shop 1', 'Address');
  console.log('SUCCESS');
} catch(e) {
  console.log('ERROR IS:', e.message);
}
