const db = require('./server/node_modules/better-sqlite3')('database.db');
const fs = require('fs');
const ordersInfo = db.prepare('PRAGMA table_info(orders);').all();
const usersInfo = db.prepare('PRAGMA table_info(users);').all();
fs.writeFileSync('db_debug.json', JSON.stringify({ orders: ordersInfo, users: usersInfo }, null, 2));
console.log('done');
