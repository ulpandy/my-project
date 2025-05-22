const dotenv = require('dotenv');
const { Pool } = require('pg');
const { logger } = require('../utils/logger');
const { URL } = require('url');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);
const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  user: dbUrl.username,
  host: dbUrl.hostname,
  database: dbUrl.pathname.slice(1),
  password: dbUrl.password,
  port: Number(dbUrl.port),
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    console.log('✅ PostgreSQL connected at:', res.rows[0].now);
  }
});

pool.connect()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully');
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

  console.log('✅ database.js loaded');
console.log('✅ typeof exported query:', typeof module.exports.query);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
