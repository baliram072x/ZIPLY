import Database from './server/node_modules/better-sqlite3/lib/database.js';
const db = new Database('./server/database.db');
console.log('Users:', db.prepare('SELECT * FROM users').all());
console.log('Orders:', db.prepare('SELECT * FROM orders').all());
