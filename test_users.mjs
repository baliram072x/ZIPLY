import Database from './server/node_modules/better-sqlite3/lib/database.js';
const db = new Database('./database.db');
console.log('USERS:', db.prepare('SELECT id, name FROM users').all());
